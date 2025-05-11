// src/appState/diffEngine/types/sequencer/createSequencer.ts

import { createSequencer, sequencers } from '@/components/sequencer/factories/SequencerFactory.js';
import { AppState, SequencerState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a CREATE_SEQUENCER diff to add a new sequencer.
 */
export function applyCREATE_SEQUENCER(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);

  newState.sequencers.push({
    id: diff.id,
    instrument: diff.instrument,
    notes: diff.notes ?? [],
    volume: diff.volume,
    pan: diff.pan,
  });

  const existing = sequencers.find(s => s.id === diff.id);
  if (!existing) {
    const initialState: SequencerState = {
      id: diff.id,
      instrument: diff.instrument,
      notes: diff.notes ?? [],
      volume: diff.volume,
      pan: diff.pan,
    };    

    const { seq, wrapper } = createSequencer(initialState);
  }

  return newState;
}

/**
 * Creates a diff to create a sequencer.
 */
export function createCreateSequencerDiff(
  id: number,
  instrument: string,
  volume?: number,
  pan?: number
): Diff {
  return {
    type: 'CREATE_SEQUENCER',
    id,
    instrument,
    volume,
    pan,
  };
}

/**
 * Creates a reverse diff to delete the newly created sequencer.
 */
export function createReverseCreateSequencerDiff(id: number): Diff {
  return {
    type: 'DELETE_SEQUENCER',
    id,
  };
}
