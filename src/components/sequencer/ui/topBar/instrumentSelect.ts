// src/components/sequencer/ui/topBar/instrumentSelect.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface InstrumentSelectUI {
  button: HTMLButtonElement;
  label: HTMLSpanElement;
}

/**
 * Creates the instrument select button + track name label.
 */
export function createInstrumentSelect(): InstrumentSelectUI {
  const skin = getCurrentSkin();

  const button = h('button', {
    class: [
      'instrument-select-btn',
      'side-button-primary',
      'cursor-pointer px-2 py-1 rounded w-8',
      'flex items-center justify-center',
      skin.buttonPrimaryColor,
      skin.buttonPrimaryColorHover,
      skin.textColor
    ].join(' '),
    title: 'Change Instrument'
  }, icon('icon-list-instrument', 'Change Instrument')) as HTMLButtonElement;

  const label = h('span', {
    class: `track-name font-semibold ${skin.textColor}`
  }, 'Track') as HTMLSpanElement;

  return {
    button,
    label
  };
}
