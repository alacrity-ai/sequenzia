// src/components/userconfig/interfaces/UserConfig.ts

import type { OpenAISettings } from './OpenAISettings.js';
import type { ThemeSettings } from './ThemeSettings.js';
import type { GlobalSettings } from './GlobalSettings.js';

export interface UserConfig {
  global: GlobalSettings;
  theme: ThemeSettings;
  ai: OpenAISettings;
}
