// src/shared/dev/tools/popoverEmitterTools.ts

import { PopoverEmitter } from '@/shared/ui/PopoverEmitter.js';

import type { Popover } from 'flowbite';

export function getAllPopoverSubscribers(): Set<{ instance: Popover; contentEl: HTMLElement }> {
  return PopoverEmitter.getSubscribers();
}

/**
 * Toggles all popovers open or closed.
 * Used for dev testing and debugging.
 */
export function toggleAllPopovers(): void {
  PopoverEmitter.toggleAll();
}

/**
 * Shows all popovers.
 * Used for dev testing and debugging.
 */
export function showAllPopovers(): void {
  PopoverEmitter.showAll();
}

/**
 * Hides all popovers.
 * Used for dev testing and debugging.
 */
export function hideAllPopovers(): void {
  PopoverEmitter.hideAll();
}
