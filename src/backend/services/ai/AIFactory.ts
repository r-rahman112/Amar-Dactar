import { AIProvider } from './AIProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { aiConfig } from '../../config/aiConfig';

class AIFactory {
  getProvider(): AIProvider {
    switch (aiConfig.provider?.toLowerCase()) {
      case 'ollama':
        return new OllamaProvider();
      case 'openrouter':
      default:
        return new OpenRouterProvider();
    }
  }
}

export const aiFactory = new AIFactory();
