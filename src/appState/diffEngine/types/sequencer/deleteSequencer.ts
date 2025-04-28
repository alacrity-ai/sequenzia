// src/appState/diffEngine/types/sequencer/deleteSequencer.ts

import { sequencers } from '../../../../setup/sequencers.js';
import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Applies a DELETE_SEQUENCER diff to remove a sequencer.
 */
export function applyDELETE_SEQUENCER(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.sequencers = newState.sequencers.filter(s => s.id !== diff.id);

  const index = sequencers.findIndex(seq => seq.id === diff.id);
  if (index !== -1) {
    const seq = sequencers[index];
    seq.destroy();             // ✅ Remove DOM/UI elements
    sequencers.splice(index, 1); // ✅ Remove from live model
  }

  return newState;
}

/**
 * Creates a diff to delete a sequencer.
 */
export function createDeleteSequencerDiff(id: number, instrument: string, notes: any[] = []): Diff {
  return {
    type: 'DELETE_SEQUENCER',
    id,
    instrument,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to recreate a deleted sequencer.
 */
export function createReverseDeleteSequencerDiff(id: number, instrument: string, notes: any[] = []): Diff {
  return {
    type: 'CREATE_SEQUENCER',
    id,
    instrument,
    notes: structuredClone(notes),
  };
}
