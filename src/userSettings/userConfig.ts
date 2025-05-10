// src/userSettings/userConfig.ts

import { initTooltips } from 'flowbite';

import { UserConfigModal } from './ui/UserConfigModal.js';
import { createGlobalSettingsSection } from './ui/sections/GlobalSettingsSection.js';
import { createThemeSettingsSection } from './ui/sections/ThemeSettingsSection.js';
import { createAISettingsSection } from './ui/sections/AISettingsSection.js';

import { attachModalListeners } from './listeners/attachModalListeners.js';
import { attachAISettingsListeners } from './listeners/attachAISettingsListeners.js';
import { attachThemeSettingsListeners } from './listeners/attachThemeSettingsListeners.js';
import { attachGlobalSettingsListeners } from './listeners/attachGlobalSettingsListeners.js';

import { getUserConfig, updateUserConfig } from './store/userConfigStore.js';
import { saveUserConfigToLocalStorage } from './utils/localStorage.js';
import type { UserConfig } from './interfaces/UserConfig.js';

export class UserConfigModalController {
  private modal: UserConfigModal | null = null;
  private detachFns: (() => void)[] = [];
  private refreshFns: (() => void)[] = [];
  private initialSnapshot: UserConfig = structuredClone(getUserConfig());

  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    this.modal = new UserConfigModal();

    // Create and inject section content
    const globalSection = createGlobalSettingsSection();
    const themeSection = createThemeSettingsSection();
    const aiSection = createAISettingsSection();

    this.modal.getSectionContainer('global').appendChild(globalSection);
    this.modal.getSectionContainer('theme').appendChild(themeSection);
    this.modal.getSectionContainer('ai').appendChild(aiSection);

    // Attach listeners
    const modalDetach = attachModalListeners(this.modal, {
      onSave: () => saveUserConfigToLocalStorage(),
      onClose: () => updateUserConfig(this.initialSnapshot)
    });

    const global = attachGlobalSettingsListeners(globalSection);
    const theme = attachThemeSettingsListeners(themeSection);
    const ai = attachAISettingsListeners(aiSection);

    this.detachFns.push(modalDetach, global.detach, theme.detach, ai.detach);
    this.refreshFns.push(global.refreshUI, theme.refreshUI, ai.refreshUI);

    // Activate tooltips
    initTooltips();

    // Append modal to DOM
    document.body.appendChild(this.modal.render());
  }

  public show(): void {
    this.initialSnapshot = structuredClone(getUserConfig());
    this.refreshFns.forEach(fn => fn());
    this.modal?.show();
  }

  public hide(): void {
    this.modal?.hide();
  }

  public destroy(): void {
    this.detachFns.forEach(fn => fn());
    this.modal?.destroy();
    this.modal = null;
    this.detachFns = [];
    this.refreshFns = [];
  }

  public reload(): void {
    this.destroy();
    this.initializeUI();
  }
}
