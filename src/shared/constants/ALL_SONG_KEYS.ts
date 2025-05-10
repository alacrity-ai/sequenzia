// src/shared/constants/ALL_SONG_KEYS.ts

import type { SongKey } from '@/shared/types/SongKey.ts';

export const ALL_SONG_KEYS: SongKey[] = [
  // Major keys
  'C M', 'C#M', 'DbM', 'D M', 'D#M', 'EbM',
  'E M', 'E#M', 'FbM', 'F M', 'F#M', 'GbM',
  'G M', 'G#M', 'AbM', 'A M', 'A#M', 'BbM',
  'B M', 'B#M', 'CbM',

  // Minor keys
  'C m', 'C#m', 'Dbm', 'D m', 'D#m', 'Ebm',
  'E m', 'E#m', 'Fbm', 'F m', 'F#m', 'Gbm',
  'G m', 'G#m', 'Abm', 'A m', 'A#m', 'Bbm',
  'B m', 'B#m', 'Cbm',
].map(k => k.replace(' ', '') as SongKey); // clean formatting
