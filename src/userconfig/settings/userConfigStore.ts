// js/userconfig/settings/userConfig.js

import { defaultUserConfig } from './defaultUserConfig.js';
import type { UserConfig } from '../interfaces/UserConfig.js';

const userConfig: UserConfig = structuredClone(defaultUserConfig);

export function getUserConfig(): UserConfig {
  return userConfig;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function updateUserConfig(newConfig: DeepPartial<UserConfig>): void {
  // Deep merge the new config into the existing one
  mergeDeep(userConfig, newConfig);
}

function mergeDeep(target: any, source: any) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
