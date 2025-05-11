// src/components/topControls/components/keyboard/listeners/keyboardMouseListeners.ts

import { playNote } from '@/sounds/audio/audio.js';
import { drawKeys } from '@/components/topControls/components/keyboard/renderers/renderer.js';
import { getKeyMapRef } from '@/components/topControls/components/keyboard/services/keyboardService.js';

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches mouse interactions for the piano canvas.
 * Allows click + drag to trigger notes based on position.
 */
export function attachKeyboardMouseListeners(
  canvas: HTMLCanvasElement,
): ListenerAttachment {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  const activeNoteHandles = new Map<string, { stop: () => void }>();
  const pressedNotes = new Set<string>();
  let mouseDown = false;

  function getNoteFromPosition(x: number, y: number): string | null {
    const keyMap = getKeyMapRef();
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
    if (!note || pressedNotes.has(note) || !ctx) return;
    const handle = playNote(note);
    if (handle) {
      activeNoteHandles.set(note, handle);
      pressedNotes.add(note);
      drawKeys(ctx, getKeyMapRef(), pressedNotes, undefined);
    }
  }

  function release(note: string): void {
    if (!pressedNotes.has(note) || !ctx) return;
    const handle = activeNoteHandles.get(note);
    if (handle) {
      handle.stop();
      activeNoteHandles.delete(note);
    }
    pressedNotes.delete(note);
    drawKeys(ctx, getKeyMapRef(), pressedNotes, undefined);
  }

  function releaseAll(): void {
    for (const note of pressedNotes) {
      release(note);
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const note = getNoteFromPosition(x, y);
    press(note);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!mouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const note = getNoteFromPosition(x, y);
    press(note);
  };

  const handleMouseUp = () => {
    mouseDown = false;
    releaseAll();
  };

  const handleMouseLeave = () => {
    mouseDown = false;
    releaseAll();
  };

  // Attach listeners
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  return {
    detach: () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    },
    refreshUI: () => {}
  };
}
