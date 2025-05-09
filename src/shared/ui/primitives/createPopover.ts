// src/shared/ui/primitives/createPopover.ts

import { h } from '../domUtils.js';
import { Popover } from 'flowbite';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';
import type { PopoverOptions as FBPopoverOptions, InstanceOptions as FBInstanceOptions } from 'flowbite';

export interface PopoverOptions {
  id?: string;
  title?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  triggerType?: 'click' | 'hover' | 'none';
  offset?: number;
  onShow?: () => void;
  onHide?: () => void;
  onToggle?: () => void;
  overrideInstance?: boolean;
}

/**
 * Creates a skinned popover with a trigger and content container.
 * Returns { trigger, content, instance } so you can wire behavior flexibly.
 * Caller must append `trigger` to DOM before invoking this.
 */
export function createPopover(
  trigger: HTMLElement,
  contentBody: HTMLElement[],
  options: PopoverOptions = {}
): {
  trigger: HTMLElement;
  content: HTMLElement;
  instance: Popover;
} {
  const skin = getCurrentSkin();
  const id = options.id || `popover-${Math.random().toString(36).slice(2, 9)}`;

  // === Create content container
  const content = h('div', {
    id,
    'data-popover': '',
    role: 'tooltip',
    class: [
      'absolute z-[9999] inline-block w-64 text-sm transition-opacity duration-300',
      'border rounded-lg shadow-xs opacity-0 invisible',
      skin.menuBackground,
      skin.textColor,
      skin.borderColor,
      'bg-white dark:bg-gray-800'
    ].join(' ')
  });

  if (options.title) {
    const header = h('div', {
      class: [
        'px-3 py-2 border-b rounded-t-lg',
        'bg-gray-100 dark:bg-gray-700',
        'border-gray-200 dark:border-gray-600'
      ].join(' ')
    }, h('h3', {
      class: 'font-semibold text-gray-900 dark:text-white',
      textContent: options.title
    }));
    content.appendChild(header);
  }

  const body = h('div', {
    class: 'px-3 py-2'
  }, ...contentBody);
  content.appendChild(body);

  document.body.appendChild(content);

  const flowbiteOptions: FBPopoverOptions = {
    placement: options.placement || 'bottom',
    triggerType: options.triggerType || 'click',
    offset: options.offset ?? 10,
    onShow: options.onShow ?? (() => {}),
    onHide: options.onHide ?? (() => {}),
    onToggle: options.onToggle ?? (() => {})
  };

  const instanceOptions: FBInstanceOptions = {
    id,
    override: options.overrideInstance ?? true
  };

  const instance = new Popover(content, trigger, flowbiteOptions, instanceOptions);

  return { trigger, content, instance };
}



/*
// Example Usage

import { createPopover } from '@/shared/ui/primitives/createPopover.ts';
import { createButton } from '@/shared/ui/primitives/createButton.ts';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.ts';

const triggerButton = createButton({
  text: 'Select Key',
  kind: 'secondary'
});

const contentElements = [
  createParagraph('Choose a key from the list below.'),
  // You could inject your key buttons here
];

const { trigger, content, instance } = createPopover(triggerButton, contentElements, {
  title: 'Key Selection',
  placement: 'bottom',
  triggerType: 'click'
});

document.getElementById('some-ui-region')?.appendChild(trigger);

*/