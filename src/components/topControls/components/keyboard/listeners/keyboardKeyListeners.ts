// src/components/topControls/components/keyboard/listeners/keyboardKeyListeners.ts

import { playNote, stopNoteByPitch } from '@/sounds/instrument-player.js';
import { drawKeys } from '@/components/topControls/components/keyboard/renderers/renderer.js';
import { WHITE_KEYS, BLACK_KEYS } from '@/components/topControls/components/keyboard/helpers/constants.js';
import { isKeyboardLoopEnabled } from '@/components/topControls/components/keyboard/stores/keyboardStore.js';
import { getKeyMapRef } from '@/components/topControls/components/keyboard/stores/keyboardStore.js';

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches global keyboard listeners for triggering notes via keyboard mappings.
 */
export function attachKeyboardKeyListeners(
  canvas: HTMLCanvasElement,
): ListenerAttachment {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  const activeKeys = new Set<string>();
  const pressedNotes = new Set<string>();
  const noteHandles = new Map<string, { stop: () => void }>();

  function buildKeyToNoteMap(): Record<string, string> {
    const keyMap = getKeyMapRef();

    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const keyToNoteMap: Record<string, string> = {};
    WHITE_KEYS.forEach((keyChar, i) => {
      if (whiteNotes[i]) keyToNoteMap[keyChar] = whiteNotes[i];
    });
    BLACK_KEYS.forEach((keyChar, i) => {
      if (blackNotes[i]) keyToNoteMap[keyChar] = blackNotes[i];
    });

    return keyToNoteMap;
  }

  function pressKey(keyChar: string): void {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note || activeKeys.has(keyChar) || !ctx) return;

    activeKeys.add(keyChar);
    if (!pressedNotes.has(note)) {
      const stopFn = playNote(note, 100, isKeyboardLoopEnabled());
      if (stopFn) {
        noteHandles.set(note, { stop: stopFn });
        pressedNotes.add(note);
      }
    }

    drawKeys(ctx, getKeyMapRef(), pressedNotes, keyToNoteMap);
  }

  function releaseKey(keyChar: string): void {
    const keyToNoteMap = buildKeyToNoteMap();
    const note = keyToNoteMap[keyChar];
    if (!note || !ctx) return;

    activeKeys.delete(keyChar);
    if (pressedNotes.has(note)) {
      stopNoteByPitch(note);
      noteHandles.delete(note);
      pressedNotes.delete(note);
    }

    drawKeys(ctx, getKeyMapRef(), pressedNotes, keyToNoteMap);
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    pressKey(e.key);
  };

  const handleKeyup = (e: KeyboardEvent) => {
    releaseKey(e.key);
  };

  // Attach global listeners
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  return {
    detach: () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    },
    refreshUI: () => {}
  };
}
