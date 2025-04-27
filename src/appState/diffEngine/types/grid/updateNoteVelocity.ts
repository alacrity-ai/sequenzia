// src/appState/diffEngine/types/grid/updateNoteVelocity.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies an UPDATE_NOTE_VELOCITY diff to modify note velocities.
 * Currently not implemented.
 */
export function applyUPDATE_NOTE_VELOCITY(state: AppState, diff: Diff): AppState {
  return structuredClone(state); // TODO: Implement actual velocity update logic
}
