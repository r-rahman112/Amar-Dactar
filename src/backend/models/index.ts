export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: Date;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
}

export interface MessageRecord {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
