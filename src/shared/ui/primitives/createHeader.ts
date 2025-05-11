// src/shared/ui/primitives/createHeader.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export type HeaderSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<HeaderSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

interface HeaderOptions {
  text: string;
  size?: HeaderSize;
  additionalClasses?: string;
}

/**
 * Creates a themed section header, typically used to introduce grouped settings or UI blocks.
 * Supports optional size and custom classes.
 */
export function createHeader(options: string | HeaderOptions): HTMLElement {
  const skin = getCurrentSkin();

  if (typeof options === 'string') {
    return h('h2', {
      class: ['text-lg font-semibold mb-4', skin.textColor].join(' '),
      textContent: options
    });
  }

  const {
    text,
    size = 'md',
    additionalClasses = ''
  } = options;

  return h('h2', {
    class: [
      SIZE_CLASSES[size],
      'font-semibold mb-4',
      skin.textColor,
      additionalClasses
    ].join(' '),
    textContent: text
  });
}
