// src/setup/keyboardUI.ts

import { getKeyMap } from '../../keyboard/keys.js';
import { drawKeys } from '../../keyboard/renderer.js';
import { attachInputListeners } from '../../keyboard/interactions.js';
import { attachKeyboardListeners, detachKeyboardListeners } from '../../keyboard/keyboard-interaction.js';
import { WHITE_KEYS, BLACK_KEYS } from '../../keyboard/constants.js';

import type { KeyMap } from '../../keyboard/keys.js';

let currentOctave = 3;
let keyMap: KeyMap = getKeyMap(currentOctave);
let keyboardInputEnabled = false;

export async function setupKeyboardUI(canvas: HTMLCanvasElement): Promise<{ refreshKeyboard: () => void }> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context for keyboard canvas');

  function buildKeyToNoteMap(): Record<string, string> {
    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const map: Record<string, string> = {};
    WHITE_KEYS.forEach((k, i) => { if (whiteNotes[i]) map[k] = whiteNotes[i]; });
    BLACK_KEYS.forEach((k, i) => { if (blackNotes[i]) map[k] = blackNotes[i]; });
    return map;
  }

  function refreshKeyboard(): void {
    if (!ctx) return;
    keyMap = getKeyMap(currentOctave);
    const keyToNoteMap = keyboardInputEnabled ? buildKeyToNoteMap() : null;
    drawKeys(ctx, keyMap, new Set(), keyToNoteMap);
  }

  attachInputListeners(canvas, () => keyMap);
  refreshKeyboard();

  document.getElementById('octave-up')?.addEventListener('click', () => {
    if (currentOctave < 7) {
      currentOctave++;
      refreshKeyboard();
    }
  });

  document.getElementById('octave-down')?.addEventListener('click', () => {
    if (currentOctave > 1) {
      currentOctave--;
      refreshKeyboard();
    }
  });

  const toggleBtn = document.getElementById('disable-keyboard-inputs') as HTMLElement;
  toggleBtn.classList.remove('bg-purple-600');
  toggleBtn.classList.add('bg-gray-700');

  toggleBtn.addEventListener('click', () => {
    keyboardInputEnabled = !keyboardInputEnabled;
    if (keyboardInputEnabled) {
      attachKeyboardListeners(canvas, () => keyMap);
      toggleBtn.classList.remove('bg-gray-700');
      toggleBtn.classList.add('bg-purple-600');
    } else {
      detachKeyboardListeners();
      toggleBtn.classList.remove('bg-purple-600');
      toggleBtn.classList.add('bg-gray-700');
    }
    refreshKeyboard();
  });

  return { refreshKeyboard };
}