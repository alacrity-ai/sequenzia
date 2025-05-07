// src/shared/ui/primitives/createTooltipPair.ts

import { h } from '../domUtils.js';

/**
 * Creates a tooltip trigger + tooltip element pair.
 * Returns both for separate placement if needed.
 */
export function createTooltipPair(
    id: string,
    triggerText = '?',
    tooltipContent: HTMLElement | HTMLElement[]
  ): {
    trigger: HTMLElement;
    tooltip: HTMLElement;
  } {
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
      Array.isArray(tooltipContent) ? h('div', { class: 'space-y-2' }, ...tooltipContent) : tooltipContent,
      h('div', { class: 'tooltip-arrow', 'data-popper-arrow': '' })
    );
  
    return { trigger, tooltip };
  }