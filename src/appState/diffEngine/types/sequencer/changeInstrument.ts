// src/appState/diffEngine/types/sequencer/changeInstrument.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies a CHANGE_INSTRUMENT diff to update a sequencer's instrument.
 * Currently not implemented.
 */
export function applyCHANGE_INSTRUMENT(state: AppState, diff: Diff): AppState {
  return structuredClone(state); // TODO: Implement actual instrument change logic
}
