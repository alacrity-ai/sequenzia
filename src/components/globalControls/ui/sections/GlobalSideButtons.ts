// src/globalControls/ui/sections/GlobalSideButtons.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

export function createGlobalSideButtons(): HTMLElement {
  return h('div', {},
    h('button', {
      id: 'footer-help-btn',
      class: 'side-button side-button-info',
      title: 'Help / Documentation'
    }, icon('icon-lightbulb', 'Help')),

    h('button', {
      id: 'footer-whats-new-btn',
      class: 'side-button side-button-info',
      title: "What's New / Release Notes"
    }, icon('icon-chart-mixed', "What's New"))
  );
}
