import { h } from '@/shared/ui/domUtils.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';

/**
 * Creates the OpenAI Key Not Set Modal UI.
 * 
 * Use `#openai-key-not-set-modal` as the modal container.
 */
export function createOpenAIKeyNotSetModal(): HTMLElement {
  const header = h('h2', {
    class: 'text-lg font-semibold mb-4 text-center',
    textContent: 'API Key Required'
  });

  const message = h('p', {
    class: 'mb-6 text-center text-sm',
    textContent: 'In order to use AI Features, you must add an OpenAI API Key in the config.'
  });

  const okButton = createButton({
    id: 'key-not-set-ok',
    text: 'OK',
    kind: 'secondary',
    additionalClasses: 'w-full py-2'
  });

  const modalContent = h('div', {
    class: 'bg-gray-800 text-white rounded-lg shadow-xl p-6 w-96 flex flex-col items-center'
  }, header, message, okButton);

  const modal = h('div', {
    id: 'openai-key-not-set-modal',
    class: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden'
  }, modalContent);

  return modal;
}
