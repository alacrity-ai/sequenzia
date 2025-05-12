import { createAIWorkingModal } from './aiWorkingModalUI.js';
import { attachAIWorkingModalListeners } from './aiWorkingModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Controller for managing the AI Working Modal.
 * Handles show/hide and lifecycle methods.
 */
export class AIWorkingModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createAIWorkingModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachAIWorkingModalListeners(this.modal);
    this.detachFn = listeners.detach;
  }

  /**
   * Displays the modal.
   */
  public show(): void {
    this.modal.classList.remove('hidden');
  }

  /**
   * Immediately hides the modal.
   */
  public hide(): void {
    this.modal.classList.add('hidden');
  }

  /**
   * Detaches listeners and removes modal from DOM.
   */
  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
