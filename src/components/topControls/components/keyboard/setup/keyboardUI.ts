// // src/setup/keyboardUI.ts

// import { getKeyMap } from '@/components/topControls/components/keyboard/helpers/keys.js';
// import { drawKeys } from '@/components/topControls/components/keyboard/renderers/renderer.js';
// import { WHITE_KEYS, BLACK_KEYS } from '../helpers/constants.js';

// import type { KeyMap } from '../helpers/keys.js';

// let currentOctave = 3;
// let keyMap: KeyMap = getKeyMap(currentOctave);
// let keyboardInputEnabled = false;

// export async function setupKeyboardUI(canvas: HTMLCanvasElement): Promise<{ refreshKeyboard: () => void }> {
//   const ctx = canvas.getContext('2d');
//   if (!ctx) throw new Error('Failed to get 2D context for keyboard canvas');

//   function buildKeyToNoteMap(): Record<string, string> {
//     const whiteNotes = Object.values(keyMap)
//       .filter(k => !k.isBlack)
//       .sort((a, b) => a.x - b.x)
//       .map(k => k.note);

//     const blackNotes = Object.values(keyMap)
//       .filter(k => k.isBlack)
//       .sort((a, b) => a.x - b.x)
//       .map(k => k.note);

//     const map: Record<string, string> = {};
//     WHITE_KEYS.forEach((k, i) => { if (whiteNotes[i]) map[k] = whiteNotes[i]; });
//     BLACK_KEYS.forEach((k, i) => { if (blackNotes[i]) map[k] = blackNotes[i]; });
//     return map;
//   }

//   function refreshKeyboard(): void {
//     if (!ctx) return;
//     keyMap = getKeyMap(currentOctave);
//     const keyToNoteMap = keyboardInputEnabled ? buildKeyToNoteMap() : null;
//     drawKeys(ctx, keyMap, new Set(), keyToNoteMap);
//   }

//   refreshKeyboard();

//   document.getElementById('octave-up')?.addEventListener('click', () => {
//     if (currentOctave < 7) {
//       currentOctave++;
//       refreshKeyboard();
//     }
//   });

//   document.getElementById('octave-down')?.addEventListener('click', () => {
//     if (currentOctave > 1) {
//       currentOctave--;
//       refreshKeyboard();
//     }
//   });
