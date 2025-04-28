// js/userconfig/settings/userConfig.js

import { UserConfig } from '../interfaces/UserConfig.js';

const userConfig: UserConfig = {
  openaiApiKey: '',
  openaiModel: 'gpt-4o',
  gridColorScheme: 'Darkroom',
  noteColorScheme: 'Track Color'
};

export function getUserConfig(): UserConfig {
  return userConfig;
}

export function updateUserConfig(newConfig: Partial<UserConfig>): void {
  Object.assign(userConfig, newConfig);
}
