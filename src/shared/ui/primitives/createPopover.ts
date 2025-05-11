// src/shared/ui/primitives/createPopover.ts

import { h } from '../domUtils.js';
import { Popover } from 'flowbite';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
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
 * Creates a skinned, animated popover and wires it to the given trigger.
 * Handles DOM creation, styling, and flowbite behavior overrides.
 *
 * Returns { trigger, content, instance } so you can optionally manage or dispose the popover later.
 */
export function createPopover(
  trigger: HTMLElement,
  contentBody: HTMLElement[] = [],
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

  // === Add global keydown-to-close behavior
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  instance.updateOnShow(() => {
    keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.length === 1) {
        instance.hide();
      }
    };
    document.addEventListener('keydown', keydownHandler, { once: true });

    // Correct: pass PopoverInterface
    flowbiteOptions.onShow?.(instance);
  });

  instance.updateOnHide(() => {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }

    // Correct: pass PopoverInterface
    flowbiteOptions.onHide?.(instance);
  });

  return { trigger, content, instance };
}
