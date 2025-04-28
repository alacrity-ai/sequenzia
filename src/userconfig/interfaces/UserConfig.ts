// src/userconfig/interfaces/UserConfig.ts

import { OpenAIModel } from './OpenAISettings.js';

export interface UserConfig {
  openaiApiKey: string;
  openaiModel: OpenAIModel;
  gridColorScheme: string;
  noteColorScheme: string;
}
