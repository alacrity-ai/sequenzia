import { h } from '@/shared/ui/domUtils.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';

/**
 * Creates the AI Generation Failed Modal UI.
 * 
 * Root element is #ai-generation-failed-modal.
 */
export function createAIGenerationFailedModal(): HTMLElement {
  const header = h('h2', {
    class: 'text-lg font-semibold mb-4 text-center',
    textContent: 'AI Generation Failed'
  });

  const message = h('p', {
    class: 'mb-6 text-center text-sm',
    textContent: 'Unable to generate AI content. Please try again.'
  });

  const okButton = createButton({
    id: 'generation-failed-ok',
    text: 'OK',
    kind: 'secondary',
    additionalClasses: 'w-full py-2'
  });

  const modalContent = h('div', {
    class: 'bg-gray-800 text-white rounded-lg shadow-xl p-6 w-96 flex flex-col items-center'
  }, header, message, okButton);

  const modal = h('div', {
    id: 'ai-generation-failed-modal',
    class: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden'
  }, modalContent);

  return modal;
}
