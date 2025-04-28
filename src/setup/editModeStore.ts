// src/setup/editModeStore.js

import { endPasteMode } from './pasteModeStore.js';
import { EditMode } from '../sequencer/interfaces/EditMode.js';

export const EditModes = {
  NOTE_PLACEMENT: 'note-placement',
  SELECT: 'select',
  NONE: 'none', // ✅ Include NONE here, matches EditMode definition
} as const;

let currentMode: EditMode = EditModes.NOTE_PLACEMENT;
const subscribers = new Set<(mode: EditMode) => void>();

export function getEditMode(): EditMode {
  return currentMode;
}

export function setEditMode(mode: EditMode): void {
  // 🧼 Always exit paste mode on edit mode switch
  endPasteMode();
  currentMode = mode;
  for (const cb of subscribers) {
    cb(mode);
  }
}

export function subscribeEditMode(cb: (mode: EditMode) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// === Temporary select mode flag ===
let isTemporarySelectMode = false;

export function enterTemporarySelectMode(): void {
  isTemporarySelectMode = true;
  setEditMode(EditModes.SELECT);
}

export function clearTemporarySelectModeFlag(): void {
  isTemporarySelectMode = false;
}

export function shouldAutoExitSelectMode(): boolean {
  return isTemporarySelectMode;
}

// === Suppress next note placement ===
let suppressNextNotePlacement = false;

export function setSuppressNextNotePlacement(v: boolean = true): void {
  suppressNextNotePlacement = v;
}

export function shouldSuppressNotePlacement(): boolean {
  return suppressNextNotePlacement;
}

export function clearSuppressNextNotePlacementFlag(): void {
  suppressNextNotePlacement = false;
}

export function clearSuppressNotePlacementFlag(): void {
  suppressNextNotePlacement = false;
}
