import { OpenAIModel } from '../../userconfig/interfaces/OpenAISettings.js';

export interface ResponseCompletionOptions {
  model?: OpenAIModel;
  name?: string;
  temperature?: number;
}
