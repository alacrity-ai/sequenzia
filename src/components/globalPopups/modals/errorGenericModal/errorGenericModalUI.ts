// src/components/globalPopups/modals/errorGenericModal/errorGenericModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';

/**
 * Creates the generic error modal UI.
 * 
 * Use `#error-message-content` to inject the dynamic error message text.
 */
export function createErrorGenericModal(): HTMLElement {
  const glow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const header = h('h2', {
    class: 'text-xl font-semibold mb-4 text-center tracking-wide z-10',
    textContent: 'Oops!'
  });

  const messageBox = h('div', {
    id: 'error-message-content',
    class: [
      'bg-gray-700 text-gray-100 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
      'z-10 max-h-[240px] overflow-y-auto text-center'
    ].join(' ')
  });

  const closeButton = createButton({
    id: 'error-close-btn',
    text: 'Close',
    kind: 'primary',
    additionalClasses: 'mt-8 self-center text-base px-6 py-2 font-medium'
  });

  // Wrap in modal (w-420px equivalent)
  const modal = createFloatingModal('error-modal', [
    glow,
    header,
    messageBox,
    closeButton
  ], {
    widthClass: 'w-[420px]',
    maxWidthClass: 'max-w-full'
  });

  return modal;
}
