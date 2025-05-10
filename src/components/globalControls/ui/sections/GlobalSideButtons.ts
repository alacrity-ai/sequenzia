// src/globalControls/ui/sections/GlobalSideButtons.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

export function createGlobalSideButtons(): HTMLElement {
  const wrapper = h('div', {
    class: 'fixed left-[calc(50%-678px)] bottom-[20px] flex flex-col gap-2 z-[9999]'
  },
    h('button', {
      id: 'footer-help-btn',
      class: 'side-button side-button-info',
      title: 'Help / Documentation'
    }, icon('icon-lightbulb', 'Help')),

    h('button', {
      id: 'footer-whats-new-btn',
      class: 'side-button side-button-info',
      title: "What's New / Release Notes"
    }, icon('icon-circle-plus', "What's New"))
  );

  document.body.appendChild(wrapper);
  return wrapper;
}
