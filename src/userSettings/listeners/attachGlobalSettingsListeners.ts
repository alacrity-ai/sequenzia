// src/userSettings/listeners/attachGlobalSettingsListeners.ts
import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import type { ListenerAttachment } from '../interfaces/ListenerAttachment.js';
import type { NoteToolFlavor } from '../interfaces/GlobalSettings.js';

export function attachGlobalSettingsListeners(sectionEl: HTMLElement): ListenerAttachment {
  const toggle = sectionEl.querySelector<HTMLInputElement>('#note-tool-toggle');
  if (!toggle) {
    console.warn('[GlobalSettings] Toggle input not found.');
    return { detach: () => {}, refreshUI: () => {} };
  }

  const refreshUI = () => {
    const config = getUserConfig();
    toggle.checked = config.global.noteToolMode === 'express';
  };

  const handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newMode: NoteToolFlavor = input.checked ? 'express' : 'default';
    updateUserConfig({ global: { noteToolMode: newMode } });
  };

  toggle.addEventListener('change', handleChange);
  refreshUI();

  return {
    detach: () => toggle.removeEventListener('change', handleChange),
    refreshUI
  };
}
