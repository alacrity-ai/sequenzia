// src/components/topControls/components/keyboard/helpers/buildKeyToNoteMap.ts

import type { KeyMap } from './keys.js';
import { WHITE_KEYS, BLACK_KEYS } from './constants.js';

/**
 * Converts a KeyMap into a mapping from keyboard key (e.g. 'a', 's') to note (e.g. 'C4').
 */
export function buildKeyToNoteMap(keyMap: KeyMap): Record<string, string> {
  const whiteNotes = Object.values(keyMap)
    .filter(k => !k.isBlack)
    .sort((a, b) => a.x - b.x)
    .map(k => k.note);

  const blackNotes = Object.values(keyMap)
    .filter(k => k.isBlack)
    .sort((a, b) => a.x - b.x)
    .map(k => k.note);

  const map: Record<string, string> = {};
  WHITE_KEYS.forEach((keyChar, i) => { if (whiteNotes[i]) map[keyChar] = whiteNotes[i]; });
  BLACK_KEYS.forEach((keyChar, i) => { if (blackNotes[i]) map[keyChar] = blackNotes[i]; });

  return map;
}
