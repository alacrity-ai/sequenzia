// src/components/globalPopups/modals/errorGenericModal/errorGenericModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the generic error modal.
 * Binds the close button and backdrop click to hide the modal.
 */
export function attachErrorGenericModalListeners(modal: HTMLElement): ListenerAttachment {
  const closeBtn = modal.querySelector('#error-close-btn') as HTMLButtonElement | null;
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
