// src/components/topControls/components/keyboard/ui/keyboardUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import type { KeyboardUIElements } from '../interfaces/KeyboardUIElements.js';

/**
 * Creates the keyboard canvas and control buttons UI structure.
 * Returns the wrapper to be appended to the #top-controls-container.
 */
export function createKeyboardUI(): KeyboardUIElements {
  const pianoCanvas = h('canvas', {
    id: 'piano',
    width: 1260,
    height: 200,
    class: 'rounded shadow-lg border border-purple-700'
  });

  const octaveUpBtn = h('button', {
    id: 'octave-up',
    class: 'side-button side-button-primary',
    title: 'Octave Up'
  }, icon('icon-arrow-up', 'Octave Up'));

  const octaveDownBtn = h('button', {
    id: 'octave-down',
    class: 'side-button side-button-primary',
    title: 'Octave Down'
  }, icon('icon-arrow-down', 'Octave Down'));

  const instrumentSelectBtn = h('button', {
    id: 'global-instrument-select-btn',
    class: 'side-button side-button-primary',
    title: 'Select Instrument'
  }, icon('icon-list-instrument', 'Instrument'));

  const disableKeyboardInputBtn = h('button', {
    id: 'disable-keyboard-inputs',
    class: 'side-button side-button-secondary',
    title: 'Toggle Keyboard Input'
  }, icon('icon-keyboard', 'Keyboard Input'));

  const buttonColumn = h('div', {
    class: 'flex flex-col gap-2'
  }, octaveUpBtn, octaveDownBtn, instrumentSelectBtn, disableKeyboardInputBtn);

  const wrapper = h('div', {
    class: 'flex items-start gap-2'
  }, pianoCanvas, buttonColumn);

  return { wrapper, canvas: pianoCanvas };
}
