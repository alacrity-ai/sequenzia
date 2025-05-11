// src/globalControls/modals/whatsNew/whatsNewModalController.ts

import { createWhatsNewModal } from './whatsNewModalUI.js';
import { attachWhatsNewModalListeners } from './whatsNewModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

export class WhatsNewModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createWhatsNewModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachWhatsNewModalListeners(this.modal);
    this.detachFn = listeners.detach;
  }

  public show(): void {
    this.modal.classList.remove('hidden');
    this.modal.style.opacity = '1';
  }

  public hide(): void {
    this.modal.style.opacity = '0';
    this.modal.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => {
      this.modal.classList.add('hidden');
      this.modal.style.opacity = '1';
    }, 400);
  }

  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
