import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches listeners to the AI Generation Failed Modal.
 * Binds OK button to hide the modal.
 */
export function attachAIGenerationFailedModalListeners(modal: HTMLElement): ListenerAttachment {
  const okButton = modal.querySelector<HTMLButtonElement>('#generation-failed-ok');

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  okButton?.addEventListener('click', closeModal);

  return {
    detach: () => {
      okButton?.removeEventListener('click', closeModal);
    },
    refreshUI: () => {}
  };
}
