// src/keyboard/interactions.ts

import { playNote } from '../sounds/audio/audio.js';
import { drawKeys } from './renderer.js';
import { KeyInfo } from './keys.js';

let listenersAttached = false;
let getKeyMapRef: (() => Record<string, KeyInfo>) | null = null;

export function attachInputListeners(
  canvas: HTMLCanvasElement,
  getCurrentKeyMap: () => Record<string, KeyInfo>
): void {
  if (listenersAttached) return;
  listenersAttached = true;
  getKeyMapRef = getCurrentKeyMap;

  const ctx = canvas.getContext('2d');
  if (!ctx) return; // Defensive check, should never happen

  const activeNoteHandles = new Map<string, { stop: () => void }>();
  const pressedNotes = new Set<string>();

  function getNoteFromPosition(x: number, y: number): string | null {
    const keyMap = getKeyMapRef!();
    for (const key of Object.values(keyMap)) {
      if (
        key.isBlack &&
        x >= key.x &&
        x <= key.x + key.width &&
        y >= 0 &&
        y <= key.height
      ) {
        return key.note;
      }
    }
    for (const key of Object.values(keyMap)) {
      if (
        !key.isBlack &&
        x >= key.x &&
        x <= key.x + key.width &&
        y >= 0 &&
        y <= key.height
      ) {
        return key.note;
      }
    }
    return null;
  }

  function press(note: string | null): void {
    if (!note || pressedNotes.has(note)) return;
    const handle = playNote(note);
    if (handle) {
      activeNoteHandles.set(note, handle);
      pressedNotes.add(note);
      if (ctx) drawKeys(ctx, getKeyMapRef!(), pressedNotes); // guard ctx
    }
  }
  
  function release(note: string): void {
    if (!pressedNotes.has(note)) return;
    const handle = activeNoteHandles.get(note);
    if (handle) {
      handle.stop();
      activeNoteHandles.delete(note);
    }
    pressedNotes.delete(note);
    if (ctx) drawKeys(ctx, getKeyMapRef!(), pressedNotes); // guard ctx
  }

  function releaseAll(): void {
    for (const note of pressedNotes) {
      release(note);
    }
  }

  let mouseDown = false;

  canvas.addEventListener('mousedown', (e: MouseEvent) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const note = getNoteFromPosition(x, y);
    press(note);
  });

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
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
