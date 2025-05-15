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

export function getAIIndicatorEnabled(): boolean {
  return userConfig.ai.indicatorEnabled;
}

// Alias for generic use
export function getLLMModel(): string {
  return getOpenAIModel();
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

  // Only update sequencer UIs if the sequencer store has been initialized
  try {
    const sequencers = getSequencers();
    if (sequencers.length > 0) {
      for (const seq of sequencers) {
        seq.redraw();
      }
    }
  } catch (err) {
    console.warn('[updateUserConfig] Skipped sequencer UI refresh (store not ready yet).', err);
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
