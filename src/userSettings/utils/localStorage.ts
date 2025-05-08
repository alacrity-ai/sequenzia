// src/userSettings/utils/localStorage.ts

import { defaultUserConfig } from '../store/defaultUserSettings.js';
import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import { saveJSON, loadJSON } from '../../shared/utils/storage/localStorage.js';
import type { UserConfig } from '../interfaces/UserConfig.js';

const USER_CONFIG_KEY = 'userConfig';

export function resetUserConfigToDefaults(): void {
  updateUserConfig(structuredClone(defaultUserConfig));
  saveUserConfigToLocalStorage();
}

export function saveUserConfigToLocalStorage(): void {
  const config = getUserConfig();
  saveJSON(USER_CONFIG_KEY, config);
}

export function loadUserConfigFromLocalStorage(): void {
  const parsed = loadJSON<Partial<UserConfig>>(USER_CONFIG_KEY);
  if (parsed) {
    updateUserConfig(parsed);
  }
}

// Optionally auto-load
loadUserConfigFromLocalStorage();
