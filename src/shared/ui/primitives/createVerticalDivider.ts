// src/shared/ui/primitives/createVerticalDivider.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

/**
 * Creates a small vertical divider (1px wide, fixed height, purple).
 * Commonly used between control groups in transport and toolbar UIs.
 */
export function createVerticalDivider(): HTMLElement {
    const skin = getCurrentSkin();
  
    return h('div', {
      class: [
        'h-12 w-px',
        skin.accentColor,
        'shadow-inner',
        'rounded-full'
      ].join(' ')
    });
  }
  