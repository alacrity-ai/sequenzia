// src/components/topControls/components/keyboard/listeners/keyboardSideButtonListeners.ts

import { getKeyMap } from '@/components/topControls/components/keyboard/helpers/keys.js';
import { drawKeys } from '@/components/topControls/components/keyboard/renderers/renderer.js';
import { WHITE_KEYS, BLACK_KEYS } from '@/components/topControls/components/keyboard/helpers/constants.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

let currentOctave = 3;
let keyboardInputEnabled = true;

function buildKeyToNoteMap(keyMap: ReturnType<typeof getKeyMap>): Record<string, string> {
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

/**
 * Attaches click handlers to the side buttons next to the keyboard.
 */
export function attachKeyboardSideButtonListeners(container: HTMLElement): ListenerAttachment {
  const canvas = container.querySelector<HTMLCanvasElement>('#piano');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) throw new Error('Keyboard canvas not available');

  const upBtn = container.querySelector('#octave-up') as HTMLButtonElement | null;
  const downBtn = container.querySelector('#octave-down') as HTMLButtonElement | null;
  const toggleBtn = container.querySelector('#disable-keyboard-inputs') as HTMLButtonElement | null;
  const instrumentBtn = container.querySelector('#global-instrument-select-btn') as HTMLButtonElement | null;

  function refreshKeyboard(): void {
    if (!ctx) return;
    const keyMap = getKeyMap(currentOctave);
    const noteMap = keyboardInputEnabled ? buildKeyToNoteMap(keyMap) : null;
    drawKeys(ctx, keyMap, new Set(), noteMap ?? undefined);
  }

  const handleOctaveUp = () => {
    if (currentOctave < 7) {
      currentOctave++;
      refreshKeyboard();
    }
  };

  const handleOctaveDown = () => {
    if (currentOctave > 1) {
      currentOctave--;
      refreshKeyboard();
    }
  };

  const handleToggleInput = () => {
    keyboardInputEnabled = !keyboardInputEnabled;
    refreshKeyboard();
  };

  const handleInstrument = () => {
    console.log('[Keyboard] Instrument selection not implemented yet.');
  };

  upBtn?.addEventListener('click', handleOctaveUp);
  downBtn?.addEventListener('click', handleOctaveDown);
  toggleBtn?.addEventListener('click', handleToggleInput);
  instrumentBtn?.addEventListener('click', handleInstrument);

  return {
    detach: () => {
      upBtn?.removeEventListener('click', handleOctaveUp);
      downBtn?.removeEventListener('click', handleOctaveDown);
      toggleBtn?.removeEventListener('click', handleToggleInput);
      instrumentBtn?.removeEventListener('click', handleInstrument);
    },
    refreshUI: () => refreshKeyboard()
  };
}
