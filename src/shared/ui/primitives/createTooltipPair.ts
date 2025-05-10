// src/shared/ui/primitives/createTooltipPair.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';
import { createParagraph } from './createParagraph.js';

export interface TooltipPair {
  trigger: HTMLElement;
  tooltip: HTMLElement;
}

type TooltipContent = string | HTMLElement | Array<string | HTMLElement>;

/**
 * Creates a skinned tooltip trigger + tooltip element.
 */
export function createTooltipPair(
  id: string,
  triggerText = '?',
  tooltipContent: TooltipContent
): TooltipPair {
  const skin = getCurrentSkin();

  const trigger = h('span', {
    'data-tooltip-target': id,
    tabIndex: -1,
    class: [
      `${skin.textColor} border border-white/40`,
      'hover:bg-white/10',
      'font-medium rounded-full text-xs px-2 py-[2px]',
      'pointer-events-auto select-none',
      'cursor-default',
      'focus:outline-none focus:ring-0',
      'aria-hidden'
    ].join(' ')
  }, triggerText);

  const contentElements = Array.isArray(tooltipContent)
    ? tooltipContent.map(entry =>
        typeof entry === 'string' ? createParagraph(entry) : entry
      )
    : [typeof tooltipContent === 'string' ? createParagraph(tooltipContent) : tooltipContent];

  const tooltip = h('div', {
    id,
    role: 'tooltip',
    class: [
      'absolute z-10 invisible inline-block max-w-xs px-4 py-3 text-sm',
      `${skin.textColor} transition-opacity duration-300 ${skin.surfaceBackground} rounded-lg shadow-xs`,
      'opacity-0 tooltip'
    ].join(' ')
  },
    h('div', { class: 'space-y-2' }, ...contentElements),
    h('div', { class: 'tooltip-arrow', 'data-popper-arrow': '' })
  );

  return { trigger, tooltip };
}
