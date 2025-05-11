// src/components/globalPopups/modals/loadingModal/loadingModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

export function attachLoadingModalListeners(
  modal: HTMLElement,
  onCancel: () => void
): ListenerAttachment {
  const cancelBtn = modal.querySelector('#loading-modal-cancel') as HTMLButtonElement | null;

  const handleCancel = () => {
    onCancel();
  };

  cancelBtn?.addEventListener('click', handleCancel);

  return {
    detach: () => {
      cancelBtn?.removeEventListener('click', handleCancel);
    },
    refreshUI: () => {}
  };
}
