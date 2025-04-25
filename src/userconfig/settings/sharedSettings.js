// js/userconfig/settings/sharedSettings.js

import { getUserConfig, updateUserConfig } from './userConfig.js';

export function resetUserConfigToDefaults() {
    updateUserConfig({
      openaiApiKey: '',
      openaiModel: 'gpt-4o'
    });
    saveToLocalStorage();
}
  
export function saveToLocalStorage() {
    localStorage.setItem('userConfig', JSON.stringify(getUserConfig()));
}

export function loadFromLocalStorage() {
    const stored = localStorage.getItem('userConfig');
    if (stored) {
        const parsed = JSON.parse(stored);
        updateUserConfig(parsed);
    }
}

// Initialize from localStorage if available
loadFromLocalStorage();
