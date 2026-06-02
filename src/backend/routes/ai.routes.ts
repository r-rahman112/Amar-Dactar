import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { aiFactory } from '../services/ai/AIFactory';
import { authenticateToken } from '../middleware/auth';
import { aiChatLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { sanitizeRequest } from '../middleware/sanitization';
import { aiChatSchema, aiSymptomSchema, aiReportSchema } from '../validators/schemas';

const router = Router();

router.use(sanitizeRequest);

router.post('/chat', authenticateToken, aiChatLimiter, validateRequest(aiChatSchema), ChatController.handleChat);

router.post('/analyze-symptoms', authenticateToken, validateRequest(aiSymptomSchema), async (req, res) => {
  try {
    const { symptoms } = req.body;
    const aiProvider = aiFactory.getProvider();
    const result = await aiProvider.symptomAnalysis(symptoms);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/explain-report', validateRequest(aiReportSchema), async (req, res) => {
  try {
    const { reportText } = req.body;
    const aiProvider = aiFactory.getProvider();
    const result = await aiProvider.reportExplanation(reportText);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
