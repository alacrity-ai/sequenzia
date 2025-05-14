// src/components/sequencer/ui/topBar/instrumentSelect.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface InstrumentSelectUI {
  instrumentButton: HTMLButtonElement;
  copyMidiButton: HTMLButtonElement;
  label: HTMLSpanElement;
}

/**
 * Creates the instrument select button, copy MIDI button, and track name label.
 */
export function createInstrumentSelect(): InstrumentSelectUI {
  const skin = getCurrentSkin();

  const instrumentButton = h('button', {
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

  const copyMidiButton = h('button', {
    draggable: 'true',
    class: [
      'copy-midi-btn',
      'side-button-secondary',
      'cursor-grab select-none',
      'px-2 py-1 rounded w-8 flex items-center justify-center',
      'transition-transform transition-opacity duration-150',
      'hover:scale-105 hover:brightness-110 active:cursor-grabbing',
      skin.buttonSecondaryColor,
      skin.buttonSecondaryColorHover,
      skin.textColor
    ].join(' '),
    title: 'Export MIDI Track (Drag to Desktop)'
  }, icon('icon-copy', 'Export MIDI')) as HTMLButtonElement;

  const label = h('span', {
    class: `track-name font-semibold ${skin.textColor}`
  }, 'Track') as HTMLSpanElement;

  return {
    instrumentButton,
    copyMidiButton,
    label
  };
}
