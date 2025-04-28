// src/setup/setupKeyboard.js

import { setupKeyboardUI } from './keyboard/keyboardUI.js';
import { setupInstrumentSelector } from './instrumentSelector.js';
import { initKeyboardInstrumentState } from './keyboard/keyboardInstrumentState.js'
import { setActiveInstrument } from '../sf2/sf2-player.js';

export async function setupKeyboard(canvas: HTMLCanvasElement) {
  await setActiveInstrument('fluidr3-gm/acoustic_grand_piano');
  
  const { refreshKeyboard } = await setupKeyboardUI(canvas);
  await setupInstrumentSelector();
  initKeyboardInstrumentState();
}
