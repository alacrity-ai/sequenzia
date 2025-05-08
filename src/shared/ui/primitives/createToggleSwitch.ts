import { h } from '../domUtils.js';

/**
 * Options to configure a horizontal toggle switch.
 */
export interface ToggleSwitchOptions {
  /** HTML `id` for the underlying `<input type="checkbox">` element. Example: `"note-tool-toggle"` */
  id: string;

  /** Label shown above the toggle row. Example: `"Note Placement:"` */
  label: string;

  /** Left-hand label (unchecked state). Example: `"Default"` */
  stateA: string;

  /** Right-hand label (checked state). Example: `"Express"` */
  stateB: string;

  /** Optional tooltip trigger element (e.g. `createTooltipPair().trigger`) to display at the end */
  tooltipTrigger?: HTMLElement;
}

/**
 * Creates a stylized toggle switch row for forms or modals.
 * Layout:
 *   [Label]
 *   [stateA] [switch] [stateB] [optional tooltip trigger]
 *
 * This is a purely presentational helper — attach behavior separately.
 *
 * Example usage:
 * ```ts
 * const toggle = createToggleSwitch({
 *   id: 'note-tool-toggle',
 *   label: 'Note Placement:',
 *   stateA: 'Default',
 *   stateB: 'Express',
 *   tooltipTrigger: createTooltipPair(...).trigger
 * });
 * ```
 */
export function createToggleSwitch(options: ToggleSwitchOptions): HTMLElement {
  const { id, label, stateA, stateB, tooltipTrigger } = options;

  const toggle = h('div', { class: 'mb-6' },
    h('label', {
      class: 'block text-sm font-medium mb-2 text-white',
      textContent: label
    }),
    h('div', { class: 'flex items-center gap-3' },
      h('span', {
        class: 'text-sm text-white',
        textContent: stateA
      }),
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
            'w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600',
            'after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
            'after:bg-white after:border-gray-300 after:border after:rounded-full',
            'after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full',
            'peer-checked:after:border-white'
          ].join(' ')
        })
      ),
      h('span', {
        class: 'text-sm text-white',
        textContent: stateB
      }),
      tooltipTrigger ?? null
    )
  );

  return toggle;
}
