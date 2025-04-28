// src/appState/diffEngine/types/sequencer/createSequencer.ts

import { createSequencer, sequencers, toggleZoomControls } from '../../../../setup/sequencers.js';
import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';

/**
 * Minimal interface for dynamic sequencer config.
 */
interface SequencerConfig {
  id: string;
  [key: string]: any;
}

/**
 * Applies a CREATE_SEQUENCER diff to add a new sequencer.
 */
export function applyCREATE_SEQUENCER(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);

  newState.sequencers.push({
    id: diff.id,
    instrument: diff.instrument,
    notes: diff.notes ?? [],
  });

  const existing = sequencers.find(s => s.id === diff.id);
  if (!existing) {
    const { seq, wrapper } = createSequencer({
      config: {
        id: parseInt(diff.id, 10),
        ...(diff.config as Partial<SequencerConfig>),
      },
      notes: diff.notes ?? [],
      instrument: diff.instrument,
    });    
    toggleZoomControls(wrapper, true);
  }

  return newState;
}

/**
 * Creates a diff to create a sequencer.
 */
export function createCreateSequencerDiff(id: string, instrument: string): Diff {
  return {
    type: 'CREATE_SEQUENCER',
    id,
    instrument,
  };
}

/**
 * Creates a reverse diff to delete the newly created sequencer.
 */
export function createReverseCreateSequencerDiff(id: string): Diff {
  return {
    type: 'DELETE_SEQUENCER',
    id,
  };
}
