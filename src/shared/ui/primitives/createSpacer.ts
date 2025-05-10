import { h } from '../domUtils.js';

/**
 * Creates an invisible horizontal spacer.
 * Useful for nudging elements apart without visual dividers.
 *
 * @param width - Tailwind width utility (e.g., '4', '8', '12', or '[30px]')
 * @returns An empty `div` element with `inline-block` display and the given width
 */
export function createSpacer(width: string = '4'): HTMLElement {
  return h('div', {
    class: `inline-block w-${width}`
  });
}
