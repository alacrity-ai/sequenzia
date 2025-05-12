import { h } from '@/shared/ui/domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface VolumeControlUI {
  element: HTMLElement;
  fill: HTMLDivElement;
  snapMarker: HTMLDivElement;
  thumb: HTMLDivElement;
}

/**
 * Creates the volume bar UI with fill, snap marker, and draggable thumb.
 */
export function createVolumeControl(): VolumeControlUI {
  const skin = getCurrentSkin();

  const fill = h('div', {
    class: `volume-fill absolute top-0 left-0 h-full bg-gradient-to-r ${skin.volumeGradientFrom} ${skin.volumeGradientTo}`,
    style: 'width: 60%;'
  }) as HTMLDivElement;

  const snapMarker = h('div', {
    class: `volume-snap-marker absolute top-0 bottom-0 w-[2px] ${skin.snapMarkerColor} pointer-events-none`,
    style: 'left: 78.74%;'
  }) as HTMLDivElement;

  const thumb = h('div', {
    class: [
      'volume-thumb absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px]',
      'rounded-full shadow-md border group-hover:scale-110',
      skin.borderColor,
      skin.volumeThumbColor
    ].join(' '),
    style: 'left: calc(60% - 5px);'
  }) as HTMLDivElement;

  const element = h('div', {
    class: `volume-bar relative w-[140px] h-[16px] rounded-full overflow-hidden shadow-inner group cursor-pointer bg-gray-700 border ${skin.borderColor}`
  }, fill, snapMarker, thumb);

  return {
    element,
    fill,
    snapMarker,
    thumb
  };
}
