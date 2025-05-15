// src/components/userSettings/interfaces/OpenAISettings.ts

import { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';

export interface OpenAISettings {
    openaiApiKey: string;
    openaiModel: LLMModel;
    indicatorEnabled: boolean;
  }


  