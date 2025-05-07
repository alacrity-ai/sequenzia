// src/userconfig/interfaces/UserConfig.ts

import type { OpenAISettings } from './OpenAISettings.js';
import type { LayoutSettings } from './LayoutSettings.js';
import type { ThemeSettings } from './ThemeSettings.js';
import type { InteractionSettings } from './InteractionSettings.js';

export interface UserConfig {
  ai: OpenAISettings;
  layout: LayoutSettings;
  theme: ThemeSettings;
  interaction: InteractionSettings;
}
