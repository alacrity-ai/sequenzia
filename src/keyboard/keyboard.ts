// src/setup/keyboard.ts

import type { EngineName } from '../sounds/interfaces/Engine.js';
import { getKeyMap } from './helpers/keys.js';
import { drawKeys } from './renderers/renderer.js';
import { attachInputListeners } from './input/interactions.js';
import { attachKeyboardListeners, detachKeyboardListeners } from './input/keyboard-interaction.js';
import { WHITE_KEYS, BLACK_KEYS } from './helpers/constants.js';
import { setGlobalActiveInstrument, getGlobalActiveInstrumentName } from '../sounds/instrument-player.js';
import { refreshInstrumentSelectorModal } from '../sequencer/ui/controls/instrumentSelector.js';

import type { KeyMap } from './helpers/keys.js';

let currentOctave = 3;
let keyMap: KeyMap = getKeyMap(currentOctave);
let keyboardInputEnabled = false;
let currentEngine: EngineName = 'sf2';

let ctx: CanvasRenderingContext2D | null = null;

export async function setupKeyboard(canvas: HTMLCanvasElement): Promise<void> {
  ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context for keyboard canvas.');

  await setGlobalActiveInstrument('sf2/fluidr3-gm/acoustic_grand_piano');

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
    keyMap = getKeyMap(currentOctave);
    const keyToNoteMap = keyboardInputEnabled ? buildKeyToNoteMap() : null;
    if (!ctx) return;
    drawKeys(ctx, keyMap, new Set(), keyToNoteMap);
  }

  attachInputListeners(canvas, () => keyMap);
  refreshKeyboard();

  // Octave controls
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

  // Enable/disable keyboard input toggle
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

  // Handle global instrument selection
  const instrumentSelectBtn = document.getElementById('global-instrument-select-btn') as HTMLElement;
  instrumentSelectBtn.addEventListener('click', async () => {
    const fullName = getGlobalActiveInstrumentName() || 'sf2/fluidr3-gm/acoustic_grand_piano';
  
    const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
    delete instrumentSelectModal.dataset.currentSequencer;
  
    await refreshInstrumentSelectorModal(fullName);
    instrumentSelectModal.classList.remove('hidden');
  });
}

export function isKeyboardLoopEnabled(): boolean {
  return (document.getElementById('instrument-loop-toggle') as HTMLInputElement)?.checked || false;
}
