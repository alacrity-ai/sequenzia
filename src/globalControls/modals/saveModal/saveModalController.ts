// src/globalControls/modals/saveModal/saveModalController.ts

import { createSaveModal } from './saveModalUI.js';
import { attachSaveModalListeners } from './saveModalListeners.js';
import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';

export class SaveModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor(showWavModal: () => void) {
    this.modal = createSaveModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachSaveModalListeners(this.modal, showWavModal);
    this.detachFn = listeners.detach;
  }

  public show(): void {
    this.modal.classList.remove('hidden');
  }

  public hide(): void {
    this.modal.classList.add('hidden');
  }

  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
