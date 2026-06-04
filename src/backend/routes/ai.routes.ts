import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { aiFactory } from '../services/ai/AIFactory';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth';
import { aiChatLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { aiChatSchema, aiSymptomSchema, aiReportSchema } from '../validators/schemas';
import { createNotification } from '../utils/notifications';
import { aiConfig } from '../config/aiConfig';

const router = Router();

router.use(sanitizeRequest);

router.get('/debug-model', async (req, res) => {
  try {
    const requestedModel = aiConfig.openrouter.model;
    const response = await fetch(`${aiConfig.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || process.env.VITE_SUPABASE_URL || 'https://amar-dactar.com',
        'X-Title': 'Amar Dactar Debug'
      },
      body: JSON.stringify({
        model: requestedModel,
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 16
      })
    });

    const data = await response.json();
    
    const debugInfo = {
      modelRequested: requestedModel,
      modelReturned: data.model,
      providerUsed: data.provider || 'unknown',
      responseId: data.id,
      fallbackInformation: data.model === requestedModel ? 'None' : 'Substituted',
      warnings: data.warning || 'None',
      rawMetadata: data
    };
    
    console.log('[DEBUG-MODEL] OpenRouter metadata:', JSON.stringify(debugInfo, null, 2));
    
    res.json(debugInfo);
  } catch (error: any) {
    console.error('[DEBUG-MODEL] error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug-env', (req, res) => {
  let viteAiModel;
  let viteAiModelPrefixed;
  
  try {
    // @ts-ignore
    viteAiModel = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.AI_MODEL : 'Not available';
    // @ts-ignore
    viteAiModelPrefixed = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AI_MODEL : 'Not available';
  } catch (e) {
    viteAiModel = 'Error accessing import.meta.env';
    viteAiModelPrefixed = 'Error accessing import.meta.env';
  }

  const envInfo = {
    source: 'Server runtime environment (process.env)',
    process_env_AI_MODEL: process.env.AI_MODEL || 'undefined',
    process_env_VITE_AI_MODEL: process.env.VITE_AI_MODEL || 'undefined',
    import_meta_env_AI_MODEL: viteAiModel,
    import_meta_env_VITE_AI_MODEL: viteAiModelPrefixed,
    effectiveModelInAiConfig: aiConfig.openrouter.model
  };
  
  console.log('[DEBUG-ENV] Environment loading audit:', JSON.stringify(envInfo, null, 2));
  res.json(envInfo);
});

router.post('/chat', authenticateToken, aiChatLimiter, validateRequest(aiChatSchema), ChatController.handleChat);

router.post('/analyze-symptoms', authenticateToken, validateRequest(aiSymptomSchema), async (req: any, res) => {
  try {
    const { symptoms } = req.body;
    const aiProvider = aiFactory.getProvider();
    const result = await aiProvider.symptomAnalysis(symptoms);
    await createNotification(req.user.id, 'REPORT_ANALYSIS_COMPLETE', 'Your symptom analysis report is complete.');
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/explain-report', optionalAuthenticateToken, validateRequest(aiReportSchema), async (req: any, res) => {
  try {
    const { reportText } = req.body;
    const aiProvider = aiFactory.getProvider();
    const result = await aiProvider.reportExplanation(reportText);
    
    if (req.user) {
      await createNotification(req.user.id, 'REPORT_ANALYSIS_COMPLETE', 'Your medical report analysis is complete.');
    }
    
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
