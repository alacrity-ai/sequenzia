// src/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the "Feature Not Implemented" modal.
 * Closes on close button click or clicking outside the modal box.
 */
export function attachFeatureNotImplementedModalListeners(modal: HTMLElement): ListenerAttachment {
  const closeBtn = modal.querySelector('#feature-modal-close-btn') as HTMLButtonElement | null;
  const modalBox = modal.querySelector('div.relative') as HTMLElement | null;

  const closeModal = () => {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.style.opacity = '1';
    }, 300);
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (!modalBox) return;
    if (!modalBox.contains(e.target as Node)) {
      closeModal();
    }
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('mousedown', handleBackdropClick);

  return {
    detach: () => {
      closeBtn?.removeEventListener('click', closeModal);
      modal.removeEventListener('mousedown', handleBackdropClick);
    },
    refreshUI: () => {}
  };
}
