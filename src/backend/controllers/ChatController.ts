import { Response } from 'express';
import { aiFactory } from '../services/ai/AIFactory';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/db';
import { SYSTEM_SAFETY_RULES } from '../prompts';
import { ModerationService } from '../services/ModerationService';

export class ChatController {
  static async handleChat(req: AuthRequest, res: Response) {
    try {
      const { messages } = req.body;
      const userId = req.user?.id;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
      }

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const aiProvider = aiFactory.getProvider();

      // Moderation Check for the latest user message
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.sender === 'user' && latestMessage.text) {
        const isProfane = await ModerationService.isProrofane(latestMessage.text);
        if (isProfane) {
          const modResult = await ModerationService.handleViolation(userId);
          if (modResult.action === 'warning') {
            return res.json({ text: modResult.message }); // Send warning instead of AI response
          } else {
             return res.status(403).json({ error: modResult.message });
          }
        }
      }
      
      const formattedMessages = [
        { role: 'system' as const, content: SYSTEM_SAFETY_RULES },
        ...messages.map((m: any) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text || ''
        }))
      ];

      const responseText = await aiProvider.chatCompletion(formattedMessages);
      res.json({ text: responseText });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: error.message || 'Failed to process AI chat request' });
    }
  }
}

