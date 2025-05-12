import { h } from '@/shared/ui/domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface PanControlUI {
  element: HTMLElement;
  fill: HTMLDivElement;
  snapMarker: HTMLDivElement;
  thumb: HTMLDivElement;
}

/**
 * Creates the pan bar UI with fill, snap marker, and draggable thumb.
 */
export function createPanControl(): PanControlUI {
  const skin = getCurrentSkin();

  const fill = h('div', {
    class: `pan-fill absolute top-0 left-0 h-full bg-gradient-to-r ${skin.panGradientFrom} ${skin.panGradientTo}`,
    style: 'width: 50%;'
  }) as HTMLDivElement;

  const snapMarker = h('div', {
    class: `pan-snap-marker absolute top-0 bottom-0 w-[2px] ${skin.snapMarkerColor} pointer-events-none`,
    style: 'left: 50%;'
  }) as HTMLDivElement;

  const thumb = h('div', {
    class: [
      'pan-thumb absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px]',
      'rounded-full shadow-md border group-hover:scale-110',
      skin.borderColor,
      skin.panThumbColor
    ].join(' '),
    style: 'left: calc(50% - 5px);'
  }) as HTMLDivElement;

  const element = h('div', {
    class: `pan-bar relative w-[140px] h-[16px] rounded-full overflow-hidden shadow-inner group cursor-pointer bg-gray-700 border ${skin.borderColor}`
  }, fill, snapMarker, thumb);

  return {
    element,
    fill,
    snapMarker,
    thumb
  };
}
