// src/shared/ui/primitives/createToggleSwitch.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

/**
 * Options to configure a horizontal toggle switch.
 */
export interface ToggleSwitchOptions {
  /** HTML `id` for the underlying `<input type="checkbox">` element. Example: `"note-tool-toggle"` */
  id: string;

  /** Label shown above the toggle row. Example: `"Note Placement:"` */
  label?: string;

  /** Left-hand label (unchecked state). Example: `"Default"` */
  stateA?: string;

  /** Right-hand label (checked state). Example: `"Express"` */
  stateB: string;

  /** Optional tooltip trigger element (e.g. `createTooltipPair().trigger`) to display at the end */
  tooltipTrigger?: HTMLElement;

  /** Optionally render the toggle switch inline with the label, rather than on a new line. */
  inline?: boolean;
}

/**
 * Creates a stylized toggle switch row for forms or modals.
 * Layout:
 *   [Label]
 *   [stateA] [switch] [stateB] [optional tooltip trigger]
 */
export function createToggleSwitch(options: ToggleSwitchOptions): HTMLElement {
  const { id, label, stateA, stateB, tooltipTrigger, inline } = options;

  const children = [];

  const skin = getCurrentSkin();

  if (stateA) {
    children.push(h('span', {
      class: `text-sm ${skin.textColor}`,
      textContent: stateA
    }));
  }

  children.push(
    h('label', {
      class: 'relative inline-flex items-center cursor-pointer'
    },
      h('input', {
        id,
        type: 'checkbox',
        class: 'sr-only peer'
      }),
      h('div', {
        class: [
          'w-11 h-6 rounded-full peer',
          skin.toggleTrackBase,
          skin.toggleTrackChecked,
          'after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
          'after:bg-white after:border after:rounded-full',
          'after:h-5 after:w-5 after:transition-all',
          skin.toggleKnobBase,
          skin.toggleKnobChecked,
          'peer-checked:after:translate-x-full'
        ].join(' ')
      })
    )
  );

  children.push(h('span', {
    class: `text-sm ${skin.textColor}`,
    textContent: stateB
  }));

  if (tooltipTrigger) {
    children.push(tooltipTrigger);
  }

  const mainRow = h('div', {
    class: 'flex items-center gap-3'
  }, ...children);

  // Return inline version
  if (inline) return mainRow;

  // Return block-styled version with label and spacing
  return h('div', { class: 'mb-6' },
    label
      ? h('label', {
          class: `block text-sm font-medium mb-2 ${skin.textColor}`,
          textContent: label
        })
      : null,
    mainRow
  );
}

