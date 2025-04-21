import { playNote } from '../audio/audio.js';
import { drawKeys } from './renderer.js';

let listenersAttached = false;
let getKeyMapRef = null;

export function attachInputListeners(canvas, getCurrentKeyMap) {
  if (listenersAttached) return;
  listenersAttached = true;
  getKeyMapRef = getCurrentKeyMap;

  const ctx = canvas.getContext('2d');
  const activeNoteHandles = new Map();
  const pressedNotes = new Set();

  function getNoteFromPosition(x, y) {
    const keyMap = getKeyMapRef();
    for (const key of Object.values(keyMap)) {
      if (key.isBlack &&
          x >= key.x && x <= key.x + key.width &&
          y >= 0 && y <= key.height) {
        return key.note;
      }
    }
    for (const key of Object.values(keyMap)) {
      if (!key.isBlack &&
          x >= key.x && x <= key.x + key.width &&
          y >= 0 && y <= key.height) {
        return key.note;
      }
    }
    return null;
  }

  function press(note) {
    if (!note || pressedNotes.has(note)) return;
    const handle = playNote(note);
    if (handle) {
      activeNoteHandles.set(note, handle);
      pressedNotes.add(note);
      drawKeys(ctx, getKeyMapRef(), pressedNotes);
    }
  }

  function release(note) {
    if (!pressedNotes.has(note)) return;
    const handle = activeNoteHandles.get(note);
    if (handle) {
      handle.stop();
      activeNoteHandles.delete(note);
    }
    pressedNotes.delete(note);
    drawKeys(ctx, getKeyMapRef(), pressedNotes);
  }

  function releaseAll() {
    for (const note of pressedNotes) {
      release(note);
    }
  }

  let mouseDown = false;

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const note = getNoteFromPosition(x, y);
    press(note);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const note = getNoteFromPosition(x, y);
    press(note); // allows drag-over pressing
  });

  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
    releaseAll();
  });

  canvas.addEventListener('mouseleave', () => {
    mouseDown = false;
    releaseAll();
  });
}
