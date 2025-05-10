// src/shared/ui/primitives/createHorizontalDivider.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

/**
 * Creates a small horizontal divider (1px tall, full width, purple).
 * Commonly used to separate sections within popovers or forms.
 */
export function createHorizontalDivider(): HTMLElement {
  const skin = getCurrentSkin();

  return h('div', {
    class: [
      'w-full h-px',
      skin.accentColor,
      'shadow-inner',
      'rounded-full',
      'my-2'
    ].join(' ')
  });
}
