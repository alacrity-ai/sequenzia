// src/components/overlays/modals/deleteConfirmModal/deleteConfirmModalController.ts

import { createDeleteConfirmModal } from './deleteConfirmModalUI.js';
import { attachDeleteConfirmModalListeners } from './deleteConfirmModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Controller for managing the Delete Confirmation Modal.
 * Handles show/hide and lifecycle methods.
 */
export class DeleteConfirmModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createDeleteConfirmModal();
    document.body.appendChild(this.modal);
  }

  /**
   * Displays the modal with provided confirm and cancel callbacks.
   * @param onConfirm - Callback when Delete is confirmed.
   * @param onCancel - Callback when Cancel is clicked.
   */
  public show(onConfirm: () => void, onCancel: () => void): void {
    // Detach any existing listeners first.
    this.detachFn?.();

    const listeners: ListenerAttachment = attachDeleteConfirmModalListeners(
      this.modal,
      onConfirm,
      onCancel
    );
    this.detachFn = listeners.detach;

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
