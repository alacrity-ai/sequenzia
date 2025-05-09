// src/shared/stores/songInfoStore.ts

import type { SongKey } from '@/shared/types/SongKey.ts';

type SongInfo = {
  songKey: SongKey | null;
};

const state: SongInfo = {
  songKey: null,
};

export function getSongKey(): SongKey | null {
  return state.songKey;
}

export function setSongKey(newKey: SongKey): void {
  state.songKey = newKey;
}
