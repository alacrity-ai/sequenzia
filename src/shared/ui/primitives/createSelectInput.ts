import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import { createLabel } from './createLabel.js';

export interface SelectInputOption {
  value: string;
  label: string;
}

export interface SelectInputOptions {
  id: string;
  label?: string;
  options: SelectInputOption[];
}

/**
 * Creates a styled select input, optionally with an attached label.
 */
export function createSelectInput({ id, label, options }: SelectInputOptions): HTMLElement {
  const skin = getCurrentSkin();

  const selectEl = h('select', {
    id,
    class: [
      'w-[80px] h-[40px] text-sm font-semibold rounded px-2 cursor-pointer',
      skin.surfaceBackground,
      skin.textColor,
      skin.borderColor
    ].join(' ')
  },
    ...options.map(opt => h('option', { value: opt.value }, opt.label))
  );

  return label
    ? h('div', { class: 'flex flex-col items-start gap-1' },
        createLabel(label),
        selectEl)
    : selectEl;
}
