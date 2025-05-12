// src/components/overlays/modals/deleteConfirmModal/deleteConfirmModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches listeners to the Delete Confirmation Modal.
 * Binds Delete and Cancel buttons to the provided callbacks.
 */
export function attachDeleteConfirmModalListeners(
  modal: HTMLElement,
  onConfirm: () => void,
  onCancel: () => void
): ListenerAttachment {
  const confirmButton = modal.querySelector<HTMLButtonElement>('#delete-confirm');
  const cancelButton = modal.querySelector<HTMLButtonElement>('#delete-cancel');

  const handleConfirm = () => {
    onConfirm();
    modal.classList.add('hidden');
  };

  const handleCancel = () => {
    onCancel();
    modal.classList.add('hidden');
  };

  confirmButton?.addEventListener('click', handleConfirm);
  cancelButton?.addEventListener('click', handleCancel);

  return {
    detach: () => {
      confirmButton?.removeEventListener('click', handleConfirm);
      cancelButton?.removeEventListener('click', handleCancel);
    },
    refreshUI: () => {}
  };
}
