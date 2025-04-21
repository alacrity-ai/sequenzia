import { playSF2Note } from '../sf2/sf2-player.js';
import { drawKeys } from './renderer.js';
import { WHITE_KEYS, BLACK_KEYS } from './constants.js';
import { stopNoteByPitch } from '../sf2/sf2-player.js';
import { isKeyboardLoopEnabled } from '../setup/keyboard.js';

let listenersAttached = false;
let getKeyMapRef = null; // 🔁 dynamic reference to current keyMap
let keydownListener = null;
let keyupListener = null;


export function attachKeyboardListeners(canvas, getCurrentKeyMap) {
  if (listenersAttached) return;
  listenersAttached = true;

  const ctx = canvas.getContext('2d');
  const activeKeys = new Set();
  const pressedNotes = new Set();
  const noteHandles = new Map();

  const whiteKeys = WHITE_KEYS;
  const blackKeys = BLACK_KEYS;

  getKeyMapRef = getCurrentKeyMap; // set dynamic lookup function

  function buildKeyToNoteMap() {
    const keyMap = getKeyMapRef();

    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const keyToNoteMap = {};
    whiteKeys.forEach((keyChar, i) => {
      if (whiteNotes[i]) keyToNoteMap[keyChar] = whiteNotes[i];
    });

    blackKeys.forEach((keyChar, i) => {
      if (blackNotes[i]) keyToNoteMap[keyChar] = blackNotes[i];
    });

    return keyToNoteMap;
  }

  function pressKey(keyChar) {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note || activeKeys.has(keyChar)) return;
  
    activeKeys.add(keyChar);
    if (!pressedNotes.has(note)) {
      const stopFn = playSF2Note(note, 100, isKeyboardLoopEnabled());
      if (stopFn) {
        noteHandles.set(note, { stop: stopFn });
        pressedNotes.add(note);
      }
    }
  
    drawKeys(ctx, getKeyMapRef(), pressedNotes, keyToNoteMap);
  }
  
  function releaseKey(keyChar) {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note) return;
  
    activeKeys.delete(keyChar);
    if (pressedNotes.has(note)) {
      stopNoteByPitch(note);
      noteHandles.delete(note);
      pressedNotes.delete(note);
    }
  
    drawKeys(ctx, getKeyMapRef(), pressedNotes, keyToNoteMap);
  }

  keydownListener = (e) => {
    if (e.repeat) return;
    pressKey(e.key);
  };
  
  keyupListener = (e) => {
    releaseKey(e.key);
  };
  
  window.addEventListener('keydown', keydownListener);
  window.addEventListener('keyup', keyupListener);
  
}

export function detachKeyboardListeners() {
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
