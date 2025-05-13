// src/components/userSettings/interfaces/OpenAISettings.ts

export interface OpenAISettings {
    openaiApiKey: string;
    openaiModel: OpenAIModel;
    autoCompleteContextBeats: number;
  }
  
  export type OpenAIModel = 
    | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'gpt-4.1-mini'
    | 'o3-mini'
    | 'o4-mini';

  export type LLMModel = 
    | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'gpt-4.1-mini'
    | 'o3-mini'
    | 'o4-mini';

  