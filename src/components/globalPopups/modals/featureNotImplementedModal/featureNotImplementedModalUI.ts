// src/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';

/**
 * Creates the "Feature Not Implemented" modal UI.
 */
export function createFeatureNotImplementedModal(): HTMLElement {
  const glow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const icon = h('div', {
    class: 'text-[100px] mb-4 z-10 animate-bounce text-center',
    textContent: '🛠️'
  });

  const title = h('div', {
    class: 'text-xl font-semibold text-white z-10 tracking-wide text-center',
    textContent: 'Feature Not Implemented'
  });

  const subtitle = h('div', {
    class: 'text-sm text-gray-400 mt-2 z-10 text-center',
    innerHTML: `This part of Sequenzia is still under construction.<br />Check back soon!`
  });

  const closeButton = createButton({
    id: 'feature-modal-close-btn',
    text: 'Got it',
    kind: 'primary',
    additionalClasses: 'mt-6 self-center z-10 px-6 py-2 text-base'
  });

  return createFloatingModal('feature-not-implemented-modal', [
    glow,
    icon,
    title,
    subtitle,
    closeButton
  ], {
    widthClass: 'w-[400px]',
    maxWidthClass: 'max-w-full'
  });
}
