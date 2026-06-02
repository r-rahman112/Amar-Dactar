export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  chatCompletion(messages: ChatMessage[]): Promise<string>;
  symptomAnalysis(symptoms: string): Promise<string>;
  reportExplanation(reportText: string): Promise<string>;
  doctorRecommendation(symptoms: string): Promise<string>;
  medicalSummary(history: string): Promise<string>;
}
