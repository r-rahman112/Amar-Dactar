import dotenv from 'dotenv';
dotenv.config();

console.log(`\n[AI CONFIG]`);
console.log(`AI_MODEL env: ${process.env.AI_MODEL ? process.env.AI_MODEL : 'undefined'}`);

export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'openrouter',
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.AI_MODEL || 'google/gemini-2.5-flash-pro',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3',
  },
  tokens: {
    generalMedicalChat: parseInt(process.env.AI_MAX_TOKENS_GENERAL || '2048', 10),
    detailedReportAnalysis: parseInt(process.env.AI_MAX_TOKENS_REPORT || '4096', 10),
  }
};

console.log(`\n[AI CONFIG]`);
console.log(`Resolved model: ${aiConfig.openrouter.model}`);
