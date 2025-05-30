import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';

/**
 * Applies a SET_VOLUME diff to update track volume.
 */
export function applySET_VOLUME(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const track = newState.sequencers.find(s => s.id === diff.id);
  if (track && typeof diff.volume === 'number') {
    track.volume = diff.volume;

    const sequencers = getSequencers();
    const liveSeq = sequencers.find(s => s.id === diff.id);
    if (liveSeq) {
        liveSeq.volume = diff.volume;
        liveSeq.refreshVolumeUI?.();
    }
  }
  return newState;
}

/**
 * Creates a forward diff for setting volume.
 */
export function createSetVolumeDiff(id: number, volume: number): Diff {
  return {
    type: 'SET_VOLUME',
    id,
    volume,
  };
}

/**
 * Creates a reverse diff for restoring the previous volume.
 */
export function createReverseSetVolumeDiff(id: number, previousVolume: number): Diff {
  return {
    type: 'SET_VOLUME',
    id,
    volume: previousVolume,
  };
}
