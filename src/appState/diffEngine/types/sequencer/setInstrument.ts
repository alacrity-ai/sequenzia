// src/appState/diffEngine/types/sequencer/setInstrument.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a SET_INSTRUMENT diff to change a sequencer's instrument.
 */
export function applySET_INSTRUMENT(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);

  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (seq && diff.instrument) {
    seq.instrument = diff.instrument;
  }

  return newState;
}

/**
 * Creates a forward diff to set a sequencer's instrument.
 */
export function createSetInstrumentDiff(sequencerId: number, instrument: string): Diff {
  return {
    type: 'SET_INSTRUMENT',
    sequencerId,
    instrument,
  };
}

/**
 * Creates a reverse diff to restore previous instrument.
 */
export function createReverseSetInstrumentDiff(sequencerId: number, previousInstrument: string): Diff {
  return {
    type: 'SET_INSTRUMENT',
    sequencerId,
    instrument: previousInstrument,
  };
}
