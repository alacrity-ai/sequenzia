import { setLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { clearAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getSequencerControllerById } from '@/components/sequencer/stores/sequencerControllerStore.js';
import type { AppState } from '@/appState/interfaces/AppState.js';
import type { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a DELETE_SEQUENCER diff to remove a sequencer.
 */
export function applyDELETE_SEQUENCER(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.sequencers = newState.sequencers.filter(s => s.id !== diff.id);

  const controller = getSequencerControllerById(diff.id);
  if (controller) {
    controller.destroy();
  } else {
    console.warn(`DELETE_SEQUENCER: No controller found for id ${diff.id}`);
  }
  
  setLastActiveSequencerId(null);
  clearAutoCompleteTargetBeat();

  return newState;
}

/**
 * Creates a diff to delete a sequencer.
 */
export function createDeleteSequencerDiff(
  id: number,
  instrument: string,
  notes: any[] = [],
  volume?: number,
  pan?: number,
  collapsed?: boolean
): Diff {
  return {
    type: 'DELETE_SEQUENCER',
    id,
    instrument,
    notes: structuredClone(notes),
    volume,
    pan,
    collapsed
  };
}

/**
 * Creates a reverse diff to recreate a deleted sequencer.
 */
export function createReverseDeleteSequencerDiff(
  id: number,
  instrument: string,
  notes: any[] = [],
  volume?: number,
  pan?: number,
  collapsed?: boolean
): Diff {
  return {
    type: 'CREATE_SEQUENCER',
    id,
    instrument,
    notes: structuredClone(notes),
    volume,
    pan,
    collapsed
  };
}
