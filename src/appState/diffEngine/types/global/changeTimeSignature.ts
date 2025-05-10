// src/appState/diffEngine/types/global/changeTimeSignature.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a SET_TIME_SIGNATURE diff to update the time signature in the state.
 */
export function applySET_TIME_SIGNATURE(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.timeSignature = [diff.beats, 4];
  return newState;
}

/**
 * Creates a forward diff to set time signature.
 */
export function createSetTimeSignatureDiff(beats: number): Diff {
  return { type: 'SET_TIME_SIGNATURE', beats };
}

/**
 * Creates a reverse diff to reset time signature (same shape).
 */
export function createReverseSetTimeSignatureDiff(beats: number): Diff {
  return createSetTimeSignatureDiff(beats);
}
