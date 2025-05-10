// src/components/userconfig/interfaces/OpenAISettings.ts

export interface OpenAISettings {
    openaiApiKey: string;
    openaiModel: OpenAIModel;
  }
  
  export type OpenAIModel = 
    | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'gpt-4.1-mini'
    | 'o3-mini'
    | 'o4-mini';
  