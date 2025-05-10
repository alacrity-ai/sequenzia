// src/components/globalControls/modals/whatsNew/whatsNewModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the What's New modal.
 * Binds to the close button only.
 */
export function attachWhatsNewModalListeners(modal: HTMLElement): ListenerAttachment {
  const closeBtn = modal.querySelector('#whats-new-close-btn') as HTMLButtonElement | null;

  const closeModal = () => {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.4s ease-out';
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.style.opacity = '1';
    }, 400);
  };

  closeBtn?.addEventListener('click', closeModal);

  return {
    detach: () => {
      closeBtn?.removeEventListener('click', closeModal);
    },
    refreshUI: () => {}
  };
}
