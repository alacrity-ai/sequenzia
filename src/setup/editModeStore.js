// src/setup/editModeStore.js

import { endPasteMode } from './pasteModeStore.js'; // ⬅️ Add this import at the top

export const EditModes = {
  NOTE_PLACEMENT: 'note-placement',
  SELECT: 'select',
  VELOCITY: 'velocity'
};

let currentMode = EditModes.NOTE_PLACEMENT;
const subscribers = new Set();

export function getEditMode() {
  return currentMode;
}

export function setEditMode(mode) {
  // 🧼 Always exit paste mode on edit mode switch
  endPasteMode();

  currentMode = mode;
  for (const cb of subscribers) cb(mode);
}

export function subscribeEditMode(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// Temporary select mode flag handling
let isTemporarySelectMode = false;

export function enterTemporarySelectMode() {
  isTemporarySelectMode = true;
  setEditMode(EditModes.SELECT);
}

export function clearTemporarySelectModeFlag() {
  isTemporarySelectMode = false;
}

export function shouldAutoExitSelectMode() {
  return isTemporarySelectMode;
}

// Suppress note placement flag handling
let suppressNextNotePlacement = false;

export function setSuppressNextNotePlacement(v = true) {
  suppressNextNotePlacement = v;
}
export function shouldSuppressNotePlacement() {
  return suppressNextNotePlacement;
}
export function clearSuppressNotePlacementFlag() {
  suppressNextNotePlacement = false;
}
