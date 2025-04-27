// src/appState/diffEngine/types/global/changeMeasures.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies a SET_TOTAL_MEASURES diff to update the total measures in the state.
 */
export function applySET_TOTAL_MEASURES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.totalMeasures = diff.measures;
  return newState;
}

/**
 * Creates a forward diff to set total measures.
 */
export function createSetTotalMeasuresDiff(measures: number): Diff {
  return { type: 'SET_TOTAL_MEASURES', measures };
}

/**
 * Creates a reverse diff to reset total measures (same shape).
 */
export function createReverseSetTotalMeasuresDiff(measures: number): Diff {
  return createSetTotalMeasuresDiff(measures);
}
