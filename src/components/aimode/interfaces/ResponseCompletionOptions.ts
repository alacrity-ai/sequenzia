import { OpenAIModel } from '@/components/userSettings/interfaces/OpenAISettings.js';

export interface ResponseCompletionOptions {
  model?: OpenAIModel;
  name?: string;
  temperature?: number;
}
