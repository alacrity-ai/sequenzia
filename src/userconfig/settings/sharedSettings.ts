// js/userconfig/settings/sharedSettings.js

import { defaultUserConfig } from './defaultUserConfig.js';
import { getUserConfig, updateUserConfig } from './userConfigStore.js';
import type { UserConfig } from '../interfaces/UserConfig.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function resetUserConfigToDefaults(): void {
  updateUserConfig(structuredClone(defaultUserConfig));
  saveToLocalStorage();
}

export function saveToLocalStorage(): void {
  if (!isBrowser()) return;
  const config = getUserConfig();
  localStorage.setItem('userConfig', JSON.stringify(config));
}

export function loadFromLocalStorage(): void {
  if (!isBrowser()) return;
  const stored = localStorage.getItem('userConfig');
  if (stored) {
    try {
      const parsed: Partial<UserConfig> = JSON.parse(stored);
      updateUserConfig(parsed);
    } catch (err) {
      console.error('Failed to parse userConfig from localStorage:', err);
    }
  }
}

if (isBrowser()) {
  loadFromLocalStorage();
}
