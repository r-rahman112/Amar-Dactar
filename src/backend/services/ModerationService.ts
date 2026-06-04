import { aiFactory } from './ai/AIFactory';
import { query } from '../config/db';

const MODERATION_PROMPT = `
You are an AI Moderation system. Analyze the following user message for abuse, harassment, hate speech, threats, or extreme profanity.
Respond ONLY with a JSON object in this format:
{"isViolating": boolean, "reason": "short string"}
`;

export class ModerationService {
  static async isProrofane(text: string): Promise<boolean> {
    try {
      const aiProvider = aiFactory.getProvider();
      const modResponseText = await aiProvider.chatCompletion([
        { role: 'system', content: MODERATION_PROMPT },
        { role: 'user', content: text }
      ]);
      const cleanText = modResponseText.replace(/\\n/g, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      const modResult = JSON.parse(cleanText);
      return modResult.isViolating === true;
    } catch (e) {
      console.error("Moderation parse error: ", e);
      return false;
    }
  }

  static async handleViolation(userId: string): Promise<{ action: 'warning' | 'banned', message: string }> {
    const userResult = await query('SELECT violations FROM users WHERE id = $1', [userId]);
    let violations = 0;
    if (userResult.rows.length > 0) {
       violations = userResult.rows[0].violations || 0;
    }
    violations += 1;

    if (violations === 1) {
      await query('UPDATE users SET violations = 1 WHERE id = $1', [userId]);
      return { action: 'warning', message: "অনুগ্রহ করে সম্মানজনক ভাষা ব্যবহার করুন।" }; // Warning
    } else {
      // 2 days ban for repeated
      const banUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await query("UPDATE users SET status = 'suspended', violations = $1, suspended_until = $2 WHERE id = $3", [violations, banUntil, userId]);
      return { action: 'banned', message: "Your account has been suspended for 2 days due to policy violations." };
    }
  }

  static async advanceDoctorReport(patientId: string): Promise<void> {
     // 5 days ban
     const banUntil = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
     await query("UPDATE users SET status = 'suspended', violations = violations + 1, suspended_until = $1 WHERE id = $2", [banUntil, patientId]);
  }
}
