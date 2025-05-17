import { h } from '../domUtils.js';
import { Popover } from 'flowbite';
import { PopoverEmitter } from '@/shared/ui/PopoverEmitter.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import type { PopoverOptions as FBPopoverOptions, InstanceOptions as FBInstanceOptions } from 'flowbite';

/**
 * Creates a tightly-sized, minimal popover for label-like content (e.g., hotkeys).
 */
export function createMinimalPopover(
  trigger: HTMLElement,
  contentBody: HTMLElement[] = [],
  options: Partial<FBPopoverOptions> = {},
  autoSubscribe: boolean = false
): {
  trigger: HTMLElement;
  content: HTMLElement;
  instance: Popover;
  unsubscribe: () => void;
} {
  const skin = getCurrentSkin();
  const id = `minipop-${Math.random().toString(36).slice(2, 9)}`;

  const content = h('div', {
    id,
    'data-popover': '',
    role: 'tooltip',
    class: [
      'absolute z-[9999] inline-block text-xs transition-opacity duration-300',
      'border rounded px-2 py-1 whitespace-nowrap opacity-0 invisible',
      skin.menuBackground,
      skin.textColor,
      skin.borderColor,
      'bg-white dark:bg-gray-800'
    ].join(' ')
  }, ...contentBody);

  document.body.appendChild(content);

  const flowbiteOptions: FBPopoverOptions = {
    placement: options.placement || 'top',
    triggerType: options.triggerType || 'hover',
    offset: options.offset ?? 6,
    onShow: options.onShow ?? (() => {}),
    onHide: options.onHide ?? (() => {}),
    onToggle: options.onToggle ?? (() => {})
  };

  const instanceOptions: FBInstanceOptions = {
    id,
    override: true
  };

  const instance = new Popover(content, trigger, flowbiteOptions, instanceOptions);

  let subscribed = false;
  if (autoSubscribe) {
    PopoverEmitter.subscribe(instance, content);
    subscribed = true;
  }

  const unsubscribe = (): void => {
    if (subscribed) {
      PopoverEmitter.unsubscribe(instance);
      subscribed = false;
    }
  };

  return { trigger, content, instance, unsubscribe };
}
