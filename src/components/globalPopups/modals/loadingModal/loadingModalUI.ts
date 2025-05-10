// src/components/globalPopups/modals/loadingModal/loadingModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';

/**
 * Renders the enhanced loading modal UI.
 */
export function createLoadingModal(): HTMLElement {
  const glow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const animation = h('div', {
    class: 'flex justify-center items-center space-x-3 mb-6 z-10'
  },
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0s'
    }),
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0.1s'
    }),
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0.2s'
    })
  );

  const title = h('div', {
    id: 'loading-modal-title',
    class: 'text-xl font-semibold text-white z-10 tracking-wide text-center',
    textContent: 'Loading Sounds...'
  });

  const subtext = h('div', {
    id: 'loading-modal-subtext',
    class: 'text-sm text-gray-400 mt-2 z-10 text-center',
    textContent: 'Please wait while we dial it in.'
  });

  const cancelBtn = h('button', {
    id: 'loading-modal-cancel',
    class: 'cursor-pointer mt-6 z-10 text-sm text-purple-400 hover:text-purple-300 underline hidden',
    textContent: 'Cancel'
  });

  return createFloatingModal('loading-modal', [
    glow,
    animation,
    title,
    subtext,
    cancelBtn
  ], {
    widthClass: 'w-[360px]',
    maxWidthClass: 'max-w-full'
  });
}
