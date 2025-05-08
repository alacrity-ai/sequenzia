// src/shared/ui/primitives/createTooltipPair.ts

import { h } from '../domUtils.js';

/**
 * A pair of elements: the trigger (e.g. "?") and the associated tooltip element.
 * 
 * This allows you to place the trigger inline in your layout,
 * while positioning the tooltip container elsewhere in the DOM if needed.
 */
export interface TooltipPair {
  trigger: HTMLElement;
  tooltip: HTMLElement;
}

/**
 * Creates a visually consistent tooltip trigger + tooltip element pair.
 *
 * Example usage:
 * ```ts
 * const { trigger, tooltip } = createTooltipPair(
 *   'tooltip-id',
 *   '?',
 *   [
 *     h('p', {}, 'Helpful explanation here.'),
 *     h('p', {}, 'Another detail...')
 *   ]
 * );
 *
 * parent.appendChild(trigger);
 * parent.appendChild(tooltip); // or elsewhere
 * ```
 *
 * @param id - A unique string used for `id` on the tooltip and `data-tooltip-target` on the trigger.
 * @param triggerText - The text to render inside the tooltip trigger element. Default: `'?'`
 * @param tooltipContent - Either a single HTMLElement or an array of HTMLElements (wrapped with spacing).
 */
export function createTooltipPair(
  id: string,
  triggerText = '?',
  tooltipContent: HTMLElement | HTMLElement[]
): TooltipPair {
  const trigger = h('span', {
    'data-tooltip-target': id,
    tabIndex: -1,
    class: [
      'text-white border border-white/40',
      'hover:bg-white/10',
      'font-medium rounded-full text-xs px-2 py-[2px]',
      'pointer-events-auto select-none',
      'cursor-default',
      'focus:outline-none focus:ring-0',
      'aria-hidden'
    ].join(' ')
  }, triggerText);

  const tooltip = h('div', {
    id,
    role: 'tooltip',
    class: [
      'absolute z-10 invisible inline-block max-w-xs px-4 py-3 text-sm',
      'text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs',
      'opacity-0 tooltip dark:bg-gray-700'
    ].join(' ')
  },
    Array.isArray(tooltipContent)
      ? h('div', { class: 'space-y-2' }, ...tooltipContent)
      : tooltipContent,
    h('div', { class: 'tooltip-arrow', 'data-popper-arrow': '' })
  );

  return { trigger, tooltip };
}
