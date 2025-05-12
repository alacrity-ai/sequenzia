import { createSequencerController } from '@/components/sequencer/factories/sequencerControllerFactory.js';
import { getSequencerById } from '@/components/sequencer/stores/sequencerStore.js';
import type { AppState, SequencerState } from '@/appState/interfaces/AppState.js';
import type { Diff } from '@/appState/interfaces/Diff.js';

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
    collapsed: diff.collapsed,
  });

  const existing = getSequencerById(diff.id);
  if (!existing) {
    const initialState: SequencerState = {
      id: diff.id,
      instrument: diff.instrument,
      notes: diff.notes ?? [],
      volume: diff.volume,
      pan: diff.pan,
      collapsed: diff.collapsed,
    };

    const container = document.getElementById('sequencers-container') as HTMLElement;
    if (!container) {
      console.error('Sequencer container not found!');
      return newState;
    }

    createSequencerController(container, initialState);
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
  pan?: number,
  collapsed?: boolean
): Diff {
  return {
    type: 'CREATE_SEQUENCER',
    id,
    instrument,
    volume,
    pan,
    collapsed
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
