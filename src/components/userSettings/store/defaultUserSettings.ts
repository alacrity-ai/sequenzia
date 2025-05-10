// src/components/userconfig/defaultUserConfig.ts

import type { UserConfig } from '../interfaces/UserConfig.js';

export const defaultUserConfig: UserConfig = {
  global: {
    noteToolMode: 'default',
  },
  theme: {
    gridColorScheme: 'Darkroom',
    noteColorScheme: 'Track Color',
    skin: 'Default'
  },
  ai: {
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
  },
};
