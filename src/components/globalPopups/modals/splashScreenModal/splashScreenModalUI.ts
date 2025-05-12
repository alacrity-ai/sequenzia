// src/components/globalPopups/modals/splashScreenModal/splashScreenModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';

/**
 * Creates the Splash Screen modal UI.
 */
export function createSplashScreenModal(): HTMLElement {
  const logo = h('div', { class: 'mb-8' },
    h('img', {
      id: 'splash-logo',
      src: getAssetPath('static/svg/sequenzia-logo.svg'),
      alt: 'Sequenzia',
      class: 'w-[300px] h-auto animate-fade-in rounded-xl'
    })
  );

  const loadingDots = h('div', { class: 'flex items-center space-x-2 mb-4' },
    h('div', { class: 'w-3 h-3 bg-blue-500 rounded-full animate-bounce', style: 'animation-delay: 0s' }),
    h('div', { class: 'w-3 h-3 bg-blue-500 rounded-full animate-bounce', style: 'animation-delay: 0.1s' }),
    h('div', { class: 'w-3 h-3 bg-blue-500 rounded-full animate-bounce', style: 'animation-delay: 0.2s' })
  );

  const loadingText = h('div', {
    class: 'text-white text-xl font-medium'
  }, 'Loading Sequenzia ', h('span', { class: 'animate-pulse' }, '...'));

  const modalContent = h('div', { class: 'relative flex flex-col items-center' },
    logo,
    loadingDots,
    loadingText
  );

  const splashModal = h('div', {
    id: 'splash-modal',
    class: 'fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] hidden'
  }, modalContent);

  return splashModal;
}
