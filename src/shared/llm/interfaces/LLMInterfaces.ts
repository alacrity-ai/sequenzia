// src/shared/llm/interfaces/LLMInterfaces.ts

export type LLMModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'o3-mini' | 'o4-mini'; // etc.

export interface LLMResponseFormat {
  name: string;
  schema: Record<string, any>;
}
