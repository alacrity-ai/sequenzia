// src/shared/ui/primitives/createNumberInput.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface NumberInputOptions {
  id: string;
  value: number | string;
  min?: number;
  max?: number;
  onInput?: (e: Event) => void;
}

/**
 * Creates a skinned number input element (72px × 40px).
 */
export function createNumberInput(options: NumberInputOptions): HTMLInputElement {
  const { id, value, min, max, onInput } = options;
  const skin = getCurrentSkin();

  return h('input', {
    id,
    type: 'number',
    value: String(value),
    min: min?.toString(),
    max: max?.toString(),
    class: [
      'w-[72px] h-[40px] px-2 rounded text-sm font-semibold',
      skin.surfaceBackground,
      skin.textColor,
      skin.borderColor
    ].join(' '),
    oninput: onInput
  });
}
