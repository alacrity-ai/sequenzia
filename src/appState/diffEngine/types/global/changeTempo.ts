// src/appState/diffEngine/types/global/changeTempo.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies a CHANGE_TEMPO diff to update the tempo in the state.
 */
export function applyCHANGE_TEMPO(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.tempo = diff.bpm;
  return newState;
}

/**
 * Creates a forward diff to change tempo.
 */
export function createChangeTempoDiff(bpm: number): Diff {
  return { type: 'CHANGE_TEMPO', bpm };
}

/**
 * Creates a reverse diff to reset tempo.
 */
export function createReverseChangeTempoDiff(bpm: number): Diff {
  return createChangeTempoDiff(bpm);
}
