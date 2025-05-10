// src/components/sideMenu/ui/sideMenuUI.ts

import { h } from '@/shared/ui/domUtils.js';

/**
 * Creates the side menu buttons (piano, mixer, AI) and appends them to the top controls container.
 * @returns The root container element.
 */
export function createSideMenuUI(): HTMLElement {
  const buttonContainer = h('div', {
    id: 'left-sidebutton-column',
    class: 'absolute left-[-46px] flex flex-col gap-2 z-10'
  },
    h('button', {
      id: 'piano-toggle-btn',
      class: 'side-button side-button-info',
      title: 'Toggle Piano View',
      textContent: '🎹'
    }),
    h('button', {
      id: 'mixer-toggle-btn',
      class: 'side-button side-button-info',
      title: 'Toggle Mixer View',
      textContent: '🎛️'
    }),
    h('button', {
      id: 'ai-toggle-btn',
      class: 'side-button side-button-info',
      title: 'Toggle AI View',
      textContent: '🤖'
    })
  );

  const anchor = document.getElementById('top-controls-container');
  if (anchor) {
    anchor.appendChild(buttonContainer);
  } else {
    console.warn('[SideMenuUI] #top-controls-container not found.');
  }

  return buttonContainer;
}
