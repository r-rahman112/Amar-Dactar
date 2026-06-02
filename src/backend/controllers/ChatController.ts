import { Response } from 'express';
import { aiFactory } from '../services/ai/AIFactory';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/db';
import { SYSTEM_SAFETY_RULES } from '../prompts';

const MODERATION_PROMPT = `
You are an AI Moderation system. Analyze the following user message for abuse, harassment, hate speech, threats, or excessive offensive language.
Respond ONLY with a JSON object in this format:
{"isViolating": boolean, "reason": "short string"}
`;

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
      if (latestMessage && latestMessage.sender === 'user') {
        const modResponseText = await aiProvider.chatCompletion([
          { role: 'system', content: MODERATION_PROMPT },
          { role: 'user', content: latestMessage.text }
        ]);

        try {
          const cleanText = modResponseText.replace(/\\n/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
          const modResult = JSON.parse(cleanText);

          if (modResult.isViolating) {
            // Check user violation count in DB
            const userResult = await query('SELECT violations FROM users WHERE id = $1', [userId]);
            let violations = 0;
            if (userResult.rows.length > 0) {
               violations = userResult.rows[0].violations || 0;
            }

            violations += 1;

            if (violations === 1) {
              await query('UPDATE users SET violations = 1 WHERE id = $1', [userId]);
              return res.json({ 
                text: "অনুগ্রহ করে শালীন ভাষা ব্যবহার করুন। পুনরায় এমন আচরণ করলে আপনার অ্যাকাউন্ট সাময়িকভাবে সীমাবদ্ধ করা হতে পারে।" 
              });
            } else {
              // Suspend account on second violation
              await query("UPDATE users SET status = 'suspended', violations = $1 WHERE id = $2", [violations, userId]);
              return res.status(403).json({ error: "Your account has been suspended due to policy violations. Admin has been notified." });
            }
          }
        } catch (e) {
          console.error("Moderation parse error: ", e);
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

