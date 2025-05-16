// src/components/userSettings/ui/UserConfigModal.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createTabBar } from '@/shared/ui/primitives/createTabBar.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';

export class UserConfigModal {
  private modal: HTMLElement;
  private globalSection: HTMLElement;
  private themeSection: HTMLElement;
  private aiSection: HTMLElement;
  private keybindingsSection: HTMLElement;
  private saveButton: HTMLButtonElement;
  private closeButton: HTMLButtonElement;

  constructor() {
    // Section containers for each tab
    this.globalSection = h('div', {
      id: 'userconfig-global-settings',
      class: 'settings-section z-10'
    });

    this.themeSection = h('div', {
      id: 'userconfig-theme-settings',
      class: 'settings-section hidden z-10'
    });

    this.aiSection = h('div', {
      id: 'userconfig-ai-settings',
      class: 'settings-section hidden z-10'
    });

    this.keybindingsSection = h('div', {
      id: 'userconfig-keybindings-settings',
      class: 'settings-section hidden z-10'
    });

    // Tab bar
    const tabBar = createTabBar([
        { key: 'global-settings', icon: '⚙️', title: 'Global Settings', isActive: true },
        { key: 'theme-settings', icon: '🎹', title: 'Theme Settings' },
        { key: 'ai-settings', icon: '🤖', title: 'AI Settings' },
        { key: 'keybindings-settings', icon: '⌨️', title: 'Keybindings' }
      ]);

    // Action buttons
    this.saveButton = createButton({
        id: 'userconfig-save',
        text: 'Save',
        kind: 'primary'
      });
  
      this.closeButton = createButton({
        id: 'userconfig-close-bottom',
        text: 'Cancel',
        kind: 'secondary'
      });

    // Footer
    const footer = h('div', { class: 'flex gap-3 mt-4 z-10' }, this.saveButton, this.closeButton);

    // Final modal structure using our primitive
    this.modal = createFloatingModal('userconfig-modal', [
      tabBar,
      this.globalSection,
      this.themeSection,
      this.aiSection,
      this.keybindingsSection,
      footer
    ], 
    {
      sizePreset: 'xl',
      scrollableContent: true
    });

    document.body.appendChild(this.modal);
  }

  public render(): HTMLElement {
    return this.modal;
  }

  public show(): void {
    this.modal.classList.remove('hidden');
  }

  public hide(): void {
    this.modal.classList.add('hidden');
  }

  public destroy(): void {
    this.modal.remove();
  }

  public getSectionContainer(id: 'global' | 'theme' | 'ai' | 'keybindings'): HTMLElement {
    switch (id) {
      case 'global': return this.globalSection;
      case 'theme': return this.themeSection;
      case 'ai': return this.aiSection;
      case 'keybindings': return this.keybindingsSection;
    }
  }

  public getSaveButton(): HTMLButtonElement {
    return this.saveButton;
  }

  public getCloseButton(): HTMLButtonElement {
    return this.closeButton;
  }

  public getTabs(): NodeListOf<HTMLElement> {
    return this.modal.querySelectorAll('.settings-tab');
  }

  public getSections(): NodeListOf<HTMLElement> {
    return this.modal.querySelectorAll('.settings-section');
  }
}
