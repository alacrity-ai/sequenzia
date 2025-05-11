export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  