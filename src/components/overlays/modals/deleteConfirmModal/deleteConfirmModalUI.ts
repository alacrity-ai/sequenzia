// src/components/overlays/modals/deleteConfirmModal/deleteConfirmModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';

/**
 * Creates the Delete Confirmation Modal UI.
 * 
 * Root element is #delete-confirm-modal.
 */
export function createDeleteConfirmModal(): HTMLElement {
  const header = createHeader({ text: 'Delete Track', size: 'lg', additionalClasses: 'text-center mb-4' });

  const message = h('p', {
    class: 'mb-6 text-center text-sm',
    textContent: 'Are you sure you want to delete this track?'
  });

  const deleteButton = createButton({
    id: 'delete-confirm',
    text: 'Delete',
    kind: 'tertiary',
    additionalClasses: 'flex-1 py-2'
  });

  const cancelButton = createButton({
    id: 'delete-cancel',
    text: 'Cancel',
    kind: 'secondary',
    additionalClasses: 'flex-1 py-2'
  });

  const buttonGroup = h('div', {
    class: 'flex gap-3 w-full'
  }, deleteButton, cancelButton);

  const modalContent = [header, message, buttonGroup];

  const modal = createFloatingModal('delete-confirm-modal', modalContent, { sizePreset: 'sm' });

  return modal;
}
