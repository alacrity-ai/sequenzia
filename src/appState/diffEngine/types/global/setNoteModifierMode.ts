// src/appState/diffEngine/types/global/setNoteModifierMode.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a SET_NOTE_MODIFIER_MODE diff to update both triplet and dotted mode.
 */
export function applySET_NOTE_MODIFIER_MODE(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.isTripletMode = diff.triplet;
  newState.isDottedMode = diff.dotted;
  return newState;
}

/**
 * Creates a forward diff to set the modifier mode.
 */
export function createSetNoteModifierModeDiff(triplet: boolean, dotted: boolean): Diff {
  return { type: 'SET_NOTE_MODIFIER_MODE', triplet, dotted };
}

/**
 * Creates a reverse diff from previous state.
 */
export function createReverseSetNoteModifierModeDiff(triplet: boolean, dotted: boolean): Diff {
  return createSetNoteModifierModeDiff(triplet, dotted);
}
