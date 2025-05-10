// src/appState/diffEngine/types/global/changeSongKey.ts

import type { AppState } from '@/appState/interfaces/AppState.js';
import type { Diff } from '@/appState/interfaces/Diff.js';
import type { SongKey } from '@/shared/types/SongKey.ts';

/**
 * Applies a CHANGE_SONG_KEY diff to update the song key in the state.
 */
export function applyCHANGE_SONG_KEY(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.songKey = diff.songKey;
  return newState;
}

/**
 * Creates a forward diff to change the song key.
 */
export function createChangeSongKeyDiff(songKey: SongKey): Diff {
  return { type: 'CHANGE_SONG_KEY', songKey };
}

/**
 * Creates a reverse diff to undo a song key change.
 */
export function createReverseChangeSongKeyDiff(previousKey: SongKey): Diff {
  return createChangeSongKeyDiff(previousKey);
}
