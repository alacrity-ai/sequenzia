// src/appState/diffEngine/types/internal/checkpoint.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies a CHECKPOINT diff — simply clones state without changes.
 */
export function applyCHECKPOINT(state: AppState, diff: Diff): AppState {
  return structuredClone(state); // Does not mutate anything
}

/**
 * Creates a checkpoint diff.
 */
export function createCheckpointDiff(label: string = ''): Diff {
  return {
    type: 'CHECKPOINT',
    label,
  };
}

/**
 * Creates a reverse checkpoint diff (identical checkpoint).
 */
export function createReverseCheckpointDiff(label: string = ''): Diff {
  return createCheckpointDiff(label);
}
