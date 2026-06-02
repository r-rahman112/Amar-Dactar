export interface ChatRequestDto {
  sessionId?: string;
  messages: Array<{
    sender: 'user' | 'assistant';
    text: string;
    attachments?: any[];
  }>;
}

export interface AuthLoginDto {
  email: string;
  password?: string;
}
