// src/userSettings/userConfig.ts

// wherever you are creating/showing the modal
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
import { saveToLocalStorage } from './utils/localStorage.js';
import type { UserConfig } from './interfaces/UserConfig.js';

export class UserConfigModalController {
    private modal: UserConfigModal;
    private detachFns: (() => void)[] = [];
    private refreshFns: (() => void)[] = [];
    private initialSnapshot: UserConfig = structuredClone(getUserConfig());
  
    constructor() {
      this.modal = new UserConfigModal();
  
      // Inject section content
      const globalSection = createGlobalSettingsSection();
      const themeSection = createThemeSettingsSection();
      const aiSection = createAISettingsSection();
  
      this.modal.getSectionContainer('global').appendChild(globalSection);
      this.modal.getSectionContainer('theme').appendChild(themeSection);
      this.modal.getSectionContainer('ai').appendChild(aiSection);
  
      // Attach listeners + retain refreshers
      const modalDetach = attachModalListeners(this.modal, {
        onSave: () => saveToLocalStorage(),
        onClose: () => updateUserConfig(this.initialSnapshot)
      });
  
      const global = attachGlobalSettingsListeners(globalSection);
      const theme = attachThemeSettingsListeners(themeSection);
      const ai = attachAISettingsListeners(aiSection);
  
      this.detachFns.push(modalDetach, global.detach, theme.detach, ai.detach);
      this.refreshFns.push(global.refreshUI, theme.refreshUI, ai.refreshUI);

      // Activate tooltips via Flowbite
      initTooltips();
    }
  
    public show(): void {
      this.initialSnapshot = structuredClone(getUserConfig());
      this.refreshFns.forEach(fn => fn());
      this.modal.show();
    }
  
    public hide(): void {
      this.modal.hide();
    }
  
    public destroy(): void {
      this.detachFns.forEach(fn => fn());
      this.modal.destroy();
    }
  }
  