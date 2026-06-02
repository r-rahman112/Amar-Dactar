import { AIProvider, ChatMessage } from '../AIProvider';
import { aiConfig } from '../../../config/aiConfig';
import { SYMPTOM_PROMPT, REPORT_PROMPT, DOCTOR_PROMPT, SUMMARY_PROMPT } from '../../../prompts';

export class OpenRouterProvider implements AIProvider {
  private async fetchOpenRouter(messages: ChatMessage[]) {
    if (!aiConfig.openrouter.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const response = await fetch(`${aiConfig.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.openrouter.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-pro', // A default fast model
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content as string;
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    return this.fetchOpenRouter(messages);
  }

  async symptomAnalysis(symptoms: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYMPTOM_PROMPT },
      { role: 'user', content: symptoms }
    ];
    return this.fetchOpenRouter(messages);
  }

  async reportExplanation(reportText: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: REPORT_PROMPT },
      { role: 'user', content: reportText }
    ];
    return this.fetchOpenRouter(messages);
  }

  async doctorRecommendation(symptoms: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: DOCTOR_PROMPT },
      { role: 'user', content: symptoms }
    ];
    return this.fetchOpenRouter(messages);
  }

  async medicalSummary(history: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SUMMARY_PROMPT },
      { role: 'user', content: history }
    ];
    return this.fetchOpenRouter(messages);
  }
}
