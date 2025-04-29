// src/setup/setupKeyboard.js

import { setupKeyboardUI } from './keyboard/keyboardUI.js';
import { setupKeyboard as rigKeyboard } from './keyboard/keyboard.js';
import { initKeyboardInstrumentState } from './keyboard/keyboardInstrumentState.js'

export async function setupKeyboard(canvas: HTMLCanvasElement) {
  await rigKeyboard(canvas);
  const { refreshKeyboard } = await setupKeyboardUI(canvas);
  initKeyboardInstrumentState();
}
