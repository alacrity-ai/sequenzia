// src/globalControls/modals/loadModal/loadModalController.ts

// src/globalControls/modals/loadModal/loadModalController.ts

import { createLoadModal } from './loadModalUI.js';
import { attachLoadModalListeners } from './loadModalListeners.js';
import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';

export class LoadModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createLoadModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachLoadModalListeners(this.modal);
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
