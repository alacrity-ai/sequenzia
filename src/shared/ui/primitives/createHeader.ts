// src/shared/ui/primitives/createHeader.ts
import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

/**
 * Creates a themed section header, typically used to introduce grouped settings or UI blocks.
 */
export function createHeader(text: string): HTMLElement {
  const skin = getCurrentSkin();

  return h('h2', {
    class: [
      'text-lg font-semibold mb-4',
      skin.textColor
    ].join(' '),
    textContent: text
  });
}
