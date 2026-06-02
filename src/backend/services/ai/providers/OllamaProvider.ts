import { AIProvider, ChatMessage } from '../AIProvider';
import { aiConfig } from '../../../config/aiConfig';
import { SYMPTOM_PROMPT, REPORT_PROMPT, DOCTOR_PROMPT, SUMMARY_PROMPT } from '../../../prompts';

export class OllamaProvider implements AIProvider {
  private async fetchOllama(messages: ChatMessage[]) {
    if (!aiConfig.ollama.baseUrl) {
      throw new Error("Ollama config is missing");
    }

    const response = await fetch(`${aiConfig.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: aiConfig.ollama.model,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama API error: ${err}`);
    }

    const data = await response.json();
    return data.message.content as string;
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    return this.fetchOllama(messages);
  }

  async symptomAnalysis(symptoms: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYMPTOM_PROMPT },
      { role: 'user', content: symptoms }
    ];
    return this.fetchOllama(messages);
  }

  async reportExplanation(reportText: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: REPORT_PROMPT },
      { role: 'user', content: reportText }
    ];
    return this.fetchOllama(messages);
  }

  async doctorRecommendation(symptoms: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: DOCTOR_PROMPT },
      { role: 'user', content: symptoms }
    ];
    return this.fetchOllama(messages);
  }

  async medicalSummary(history: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SUMMARY_PROMPT },
      { role: 'user', content: history }
    ];
    return this.fetchOllama(messages);
  }
}
