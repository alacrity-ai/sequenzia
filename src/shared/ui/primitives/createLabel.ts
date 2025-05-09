// src/shared/ui/primitives/createLabel.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

export interface LabelOptions {
  text: string;
  for?: string;
  trailingElement?: HTMLElement;
}

export function createLabel(options: string | LabelOptions, trailingElement?: HTMLElement): HTMLElement {
  const skin = getCurrentSkin();

  if (typeof options === 'string') {
    return h('label', {
      class: `block text-sm font-medium mb-2 flex items-center gap-2 ${skin.textColor}`
    }, options, trailingElement ?? null);
  }

  const { text, for: htmlFor, trailingElement: trailing } = options;

  return h('label', {
    ...(htmlFor ? { htmlFor } : {}),
    class: `block text-sm font-medium mb-2 flex items-center gap-2 ${skin.textColor}`
  }, text, trailing ?? null);
}
