// js/userconfig/settings/sharedSettings.js

import { getUserConfig, updateUserConfig } from './userConfig.js';
import { OpenAISettings } from '../interfaces/OpenAISettings.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}


export function resetUserConfigToDefaults(): void {
  const defaultConfig: Partial<OpenAISettings> = {
    openaiApiKey: '',
    openaiModel: 'gpt-4o'
  };

  updateUserConfig(defaultConfig);
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
      const parsed: Partial<OpenAISettings> = JSON.parse(stored);
      updateUserConfig(parsed);
    } catch (err) {
      console.error('Failed to parse userConfig from localStorage:', err);
    }
  }
}

// Initialize from localStorage if available
if (isBrowser()) {
  loadFromLocalStorage();
}

