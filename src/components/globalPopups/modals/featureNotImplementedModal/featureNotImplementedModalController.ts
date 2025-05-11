// src/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalController.ts

import { createFeatureNotImplementedModal } from './featureNotImplementedModalUI.js';
import { attachFeatureNotImplementedModalListeners } from './featureNotImplementedModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

export class FeatureNotImplementedModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createFeatureNotImplementedModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachFeatureNotImplementedModalListeners(this.modal);
    this.detachFn = listeners.detach;
  }

  /**
   * Displays the modal.
   */
  public show(): void {
    this.modal.classList.remove('hidden');
    this.modal.style.opacity = '1';
  }

  /**
   * Immediately hides the modal.
   */
  public hide(): void {
    this.modal.classList.add('hidden');
    this.modal.style.opacity = '1';
  }

  /**
   * Detaches listeners and removes modal from DOM.
   */
  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
