// src/globalControls/ui/sections/GlobalSideButtons.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/global/assetHelpers.js';

function icon(name: string, alt: string): HTMLElement {
  return h('img', {
    src: getAssetPath(`static/svg/${name}.svg`),
    class: 'w-6 h-6',
    alt
  });
}

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
