// src/userconfig/defaultUserConfig.ts

import type { UserConfig } from './interfaces/UserConfig.js';

export const defaultUserConfig: UserConfig = {
  ai: {
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
  },
  layout: {
    darkMode: true,
  },
  theme: {
    gridColorScheme: 'Darkroom',
    noteColorScheme: 'Track Color',
  },
  interaction: {
    noteToolMode: 'default',
  },
};
