// src/components/userSettings/store/userConfigStore.ts

import { defaultUserConfig } from './defaultUserSettings.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { getSkinByName } from '../skins/index.js';

import type { UserConfig } from '../interfaces/UserConfig.js';
import type { InterfaceSkin } from '../skins/interfaces/Skin.js';

const userConfig: UserConfig = structuredClone(defaultUserConfig);

let lastSkin = userConfig.theme.skin;

export function getUserConfig(): UserConfig {
  return userConfig;
}

export function getOpenAIKey(): string {
  return userConfig.ai.openaiApiKey;
}

export function getOpenAIModel(): string {
  return userConfig.ai.openaiModel;
}

export function getCurrentSkin(): InterfaceSkin {
  return getSkinByName(userConfig.theme.skin);
}

export function getLastSkin(): InterfaceSkin {
  return getSkinByName(lastSkin);
}

export function updateLastSkin(skinName: string): void {
  lastSkin = skinName;
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
