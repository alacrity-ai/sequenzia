// src/setup/setupKeyboard.js

import { setupKeyboardUI } from '../setup/keyboardUI.js';
import { setupKeyboard as rigKeyboard } from '../keyboard.js';
import { initKeyboardInstrumentState } from '../stores/keyboardInstrumentState.js'

export async function setupKeyboard(canvas: HTMLCanvasElement) {
  await rigKeyboard(canvas);
  const { refreshKeyboard } = await setupKeyboardUI(canvas);
  initKeyboardInstrumentState();
}
