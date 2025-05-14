// src/shared/llm/profiles/ModelToProvider.ts

export const ModelToProvider: Record<string, 'openai' | 'anthropic' | 'google' | 'local'> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4.1': 'openai',
  'o3-mini': 'openai',
  'o4-mini': 'openai',
  'claude-3': 'anthropic',
  'claude-3-opus': 'anthropic',
  'mistral-7b': 'local',
  'gemini-1.5': 'google'
  // Add as needed
};
