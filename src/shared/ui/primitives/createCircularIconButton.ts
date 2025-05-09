import { h } from '../domUtils.js';

/**
 * Creates a 48x48 circular icon button with color and hover styling.
 * Not themed by skin — designed for fixed, consistent visual cues.
 */
export function createCircularIconButton(
  id: string,
  title: string,
  iconElement: HTMLElement,
  bgColor: string,
  hoverColor: string
): HTMLButtonElement {
  return h('button', {
    id,
    title,
    class: [
      'w-12 h-12 flex items-center justify-center rounded-full cursor-pointer shadow transition-all hover:scale-110',
      'text-white',
      bgColor,
      hoverColor
    ].join(' ')
  }, iconElement);
}
