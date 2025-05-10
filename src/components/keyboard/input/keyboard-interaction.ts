import { playNote, stopNoteByPitch } from '@/sounds/instrument-player.js';
import { drawKeys } from '../renderers/renderer.js';
import { WHITE_KEYS, BLACK_KEYS } from '../helpers/constants.js';
import { isKeyboardLoopEnabled } from '../stores/keyboardInstrumentState.js';
import { KeyMap } from '../helpers/keys.js';

let listenersAttached = false;

export function isKeyboardListenersAttached(): boolean {
  return listenersAttached;
}

let getKeyMapRef: (() => KeyMap) | null = null;
let keydownListener: ((e: KeyboardEvent) => void) | null = null;
let keyupListener: ((e: KeyboardEvent) => void) | null = null;

export function attachKeyboardListeners(canvas: HTMLCanvasElement, getCurrentKeyMap: () => KeyMap): void {
  if (listenersAttached) return;
  listenersAttached = true;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available.');

  const activeKeys = new Set<string>();
  const pressedNotes = new Set<string>();
  const noteHandles = new Map<string, { stop: () => void }>();

  const whiteKeys = WHITE_KEYS;
  const blackKeys = BLACK_KEYS;

  getKeyMapRef = getCurrentKeyMap;

  function buildKeyToNoteMap(): Record<string, string> {
    const keyMap = getKeyMapRef!();

    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const keyToNoteMap: Record<string, string> = {};
    whiteKeys.forEach((keyChar, i) => {
      if (whiteNotes[i]) keyToNoteMap[keyChar] = whiteNotes[i];
    });

    blackKeys.forEach((keyChar, i) => {
      if (blackNotes[i]) keyToNoteMap[keyChar] = blackNotes[i];
    });

    return keyToNoteMap;
  }

  function pressKey(keyChar: string): void {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note || activeKeys.has(keyChar)) return;
  
    activeKeys.add(keyChar);
    if (!pressedNotes.has(note)) {
      const stopFn = playNote(note, 100, isKeyboardLoopEnabled());
      if (stopFn) {
        noteHandles.set(note, { stop: stopFn });
        pressedNotes.add(note);
      }
    }
  
    if (ctx) {
      drawKeys(ctx, getKeyMapRef!(), pressedNotes, keyToNoteMap);
    }
  }
  
  function releaseKey(keyChar: string): void {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note) return;
  
    activeKeys.delete(keyChar);
    if (pressedNotes.has(note)) {
      stopNoteByPitch(note);
      noteHandles.delete(note);
      pressedNotes.delete(note);
    }
  
    if (ctx) {
      drawKeys(ctx, getKeyMapRef!(), pressedNotes, keyToNoteMap);
    }
  }  

  keydownListener = (e: KeyboardEvent) => {
    if (e.repeat) return;
    pressKey(e.key);
  };

  keyupListener = (e: KeyboardEvent) => {
    releaseKey(e.key);
  };

  window.addEventListener('keydown', keydownListener);
  window.addEventListener('keyup', keyupListener);
}

export function detachKeyboardListeners(): void {
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener);
    keydownListener = null;
  }
  if (keyupListener) {
    window.removeEventListener('keyup', keyupListener);
    keyupListener = null;
  }
  listenersAttached = false;
}
