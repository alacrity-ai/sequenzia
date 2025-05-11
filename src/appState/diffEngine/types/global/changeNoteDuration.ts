// src/appState/diffEngine/types/global/changeNoteDuration.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a CHANGE_NOTE_DURATION diff to update the note duration in the state.
 */
export function applyCHANGE_NOTE_DURATION(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.noteDuration = diff.noteDuration;
  return newState;
}

/**
 * Creates a forward diff to change the note duration.
 */
export function createChangeNoteDurationDiff(noteDuration: number): Diff {
  return { type: 'CHANGE_NOTE_DURATION', noteDuration };
}

/**
 * Creates a reverse diff to restore the prior note duration.
 */
export function createReverseChangeNoteDurationDiff(noteDuration: number): Diff {
  return createChangeNoteDurationDiff(noteDuration);
}
