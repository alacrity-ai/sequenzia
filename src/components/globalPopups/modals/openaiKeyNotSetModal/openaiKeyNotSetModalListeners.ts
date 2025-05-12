import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches listeners to the OpenAI Key Not Set Modal.
 * Binds the OK button to hide the modal on click.
 */
export function attachOpenAIKeyNotSetModalListeners(modal: HTMLElement): ListenerAttachment {
  const okButton = modal.querySelector<HTMLButtonElement>('#key-not-set-ok');

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
