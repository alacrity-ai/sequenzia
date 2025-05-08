// src/userSettings/store/userConfigStore.ts
import { defaultUserConfig } from './defaultUserSettings.js';
import type { UserConfig } from '../interfaces/UserConfig.js';
import { getSequencers } from '../../sequencer/factories/SequencerFactory.js';

const userConfig: UserConfig = structuredClone(defaultUserConfig);

export function getUserConfig(): UserConfig {
  return userConfig;
}

export function getOpenAIKey(): string {
  return userConfig.ai.openaiApiKey;
}

export function getOpenAIModel(): string {
  return userConfig.ai.openaiModel;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function updateUserConfig(newConfig: DeepPartial<UserConfig>): void {
  mergeDeep(userConfig, newConfig);

  // Refresh Sequencer UI
  for (const seq of getSequencers()) {
    seq.redraw();
  }
}

function mergeDeep(target: any, source: any) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
