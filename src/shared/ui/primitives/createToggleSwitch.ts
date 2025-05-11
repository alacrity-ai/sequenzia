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

export interface ToggleSwitchController {
  element: HTMLElement;
  input: HTMLInputElement;
  setChecked: (checked: boolean) => void;
  getChecked: () => boolean;
  update: () => void; // manual sync, if needed
}


/**
 * Creates a stylized toggle switch row for forms or modals.
 * Layout:
 *   [Label]
 *   [stateA] [switch] [stateB] [optional tooltip trigger]
 */
export function createToggleSwitch(options: ToggleSwitchOptions): ToggleSwitchController {
  const { id, label, stateA, stateB, tooltipTrigger, inline } = options;
  const skin = getCurrentSkin();

  const stateASpan = stateA ? h('span', {
    class: `text-sm transition-opacity ${skin.textColor}`,
    textContent: stateA
  }) : null;

  const stateBSpan = h('span', {
    class: `text-sm transition-opacity ${skin.textColor}`,
    textContent: stateB
  });

  const checkbox = h('input', {
    id,
    type: 'checkbox',
    class: 'sr-only peer'
  }) as HTMLInputElement;

  const switchTrack = h('div', {
    class: [
      'w-11 h-6 rounded-full peer relative',
      skin.toggleTrackBase,
      skin.toggleTrackChecked,
      'after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
      'after:bg-white after:border after:rounded-full',
      'after:h-5 after:w-5 after:transition-all',
      skin.toggleKnobBase,
      skin.toggleKnobChecked,
      'peer-checked:after:translate-x-full'
    ].join(' ')
  });

  const updateLabelStates = () => {
    const checked = checkbox.checked;
    if (stateASpan) stateASpan.style.opacity = checked ? '0.5' : '1';
    stateBSpan.style.opacity = checked ? '1' : '0.5';
  };

  checkbox.addEventListener('change', updateLabelStates);

  const children = [];
  if (stateASpan) children.push(stateASpan);
  children.push(h('label', { class: 'relative inline-flex items-center cursor-pointer' }, checkbox, switchTrack));
  children.push(stateBSpan);
  if (tooltipTrigger) children.push(tooltipTrigger);

  const mainRow = h('div', {
    class: 'flex items-center gap-3'
  }, ...children);

  const container = inline
    ? mainRow
    : h('div', { class: 'mb-6' },
        label
          ? h('label', {
              class: `block text-sm font-medium mb-2 ${skin.textColor}`,
              textContent: label
            })
          : null,
        mainRow
      );

  // Initialize visual state
  requestAnimationFrame(updateLabelStates);

  return {
    element: container,
    input: checkbox,
    setChecked: (val: boolean) => {
      checkbox.checked = val;
      updateLabelStates();
    },
    getChecked: () => checkbox.checked,
    update: updateLabelStates
  };
}
