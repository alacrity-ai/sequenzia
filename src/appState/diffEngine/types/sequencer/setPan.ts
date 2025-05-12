import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';

/**
 * Applies a SET_PAN diff to update track pan.
 */
export function applySET_PAN(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const track = newState.sequencers.find(s => s.id === diff.id);
  if (track && typeof diff.pan === 'number') {
    track.pan = diff.pan;

    const sequencers = getSequencers();
    const liveSeq = sequencers.find(s => s.id === diff.id);
    if (liveSeq) {
        liveSeq.pan = diff.pan;
        liveSeq.refreshPanUI?.();
    }
  }
  return newState;
}

/**
 * Creates a forward diff for setting pan.
 */
export function createSetPanDiff(id: number, pan: number): Diff {
  return {
    type: 'SET_PAN',
    id,
    pan,
  };
}

/**
 * Creates a reverse diff for restoring the previous pan.
 */
export function createReverseSetPanDiff(id: number, previousPan: number): Diff {
  return {
    type: 'SET_PAN',
    id,
    pan: previousPan,
  };
}
