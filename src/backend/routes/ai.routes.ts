import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { aiFactory } from '../services/ai/AIFactory';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth';
import { aiChatLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { aiChatSchema, aiSymptomSchema, aiReportSchema } from '../validators/schemas';
import { createNotification } from '../utils/notifications';

const router = Router();

router.use(sanitizeRequest);

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
