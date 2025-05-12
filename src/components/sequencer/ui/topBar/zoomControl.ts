import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface ZoomControlUI {
  element: HTMLElement;
  leadingDivider: HTMLElement;
  zoomInBtn: HTMLButtonElement;
  zoomOutBtn: HTMLButtonElement;
  zoomResetBtn: HTMLButtonElement;
  trailingDivider: HTMLElement;
}

/**
 * Creates the zoom controls: in, out, reset, with surrounding dividers.
 */
export function createZoomControl(): ZoomControlUI {
  const skin = getCurrentSkin();

  const zoomInBtn = h('button', {
    class: [
      'zoom-in-btn hidden',
      'cursor-pointer px-2 py-1 rounded w-8',
      'flex items-center justify-center',
      skin.buttonSecondaryColor,
      skin.buttonSecondaryColorHover,
      skin.textColor
    ].join(' '),
    title: 'Zoom In'
  }, icon('icon-zoom-in', 'Zoom In')) as HTMLButtonElement;

  const zoomOutBtn = h('button', {
    class: [
      'zoom-out-btn hidden',
      'cursor-pointer px-2 py-1 rounded w-8',
      'flex items-center justify-center',
      skin.buttonSecondaryColor,
      skin.buttonSecondaryColorHover,
      skin.textColor
    ].join(' '),
    title: 'Zoom Out'
  }, icon('icon-zoom-out', 'Zoom Out')) as HTMLButtonElement;

  const zoomResetBtn = h('button', {
    class: [
      'zoom-reset-btn hidden',
      'cursor-pointer px-2 py-1 rounded w-8',
      'flex items-center justify-center',
      skin.buttonSecondaryColor,
      skin.buttonSecondaryColorHover,
      skin.textColor
    ].join(' '),
    title: 'Reset Zoom'
  }, icon('icon-reset', 'Reset Zoom')) as HTMLButtonElement;

  const leadingDivider = h('div', {
    class: `zoom-button-divider hidden border-l mx-2 h-6 ${skin.borderColor}`
  });

  const trailingDivider = h('div', {
    class: `zoom-button-divider hidden border-l mx-2 h-6 ${skin.borderColor}`
  });

  const element = h('div', {
    class: 'flex items-center gap-2'
  },
    leadingDivider,
    zoomInBtn,
    zoomOutBtn,
    zoomResetBtn,
    trailingDivider
  );

  return {
    element,
    leadingDivider,
    zoomInBtn,
    zoomOutBtn,
    zoomResetBtn,
    trailingDivider
  };
}
