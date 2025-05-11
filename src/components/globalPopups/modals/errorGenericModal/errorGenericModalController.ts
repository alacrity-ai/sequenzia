// src/components/globalPopups/errorGenericModal/errorGenericModalController.ts

import { createErrorGenericModal } from './errorGenericModalUI.js';
import { attachErrorGenericModalListeners } from './errorGenericModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

export class ErrorGenericModalController {
  private modal: HTMLElement;
  private messageBox: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createErrorGenericModal();
    this.messageBox = this.modal.querySelector('#error-message-content')!;
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachErrorGenericModalListeners(this.modal);
    this.detachFn = listeners.detach;
  }

  /**
   * Displays the modal with a dynamic error message.
   * @param message - The message to display in the modal.
   */
  public show(message: string): void {
    this.messageBox.textContent = message;
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
   * Detaches listeners and removes the modal from the DOM.
   */
  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
