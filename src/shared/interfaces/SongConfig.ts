// src/shared/interfaces/SongConfig.ts

import type { SongKey } from '@/shared/types/SongKey.js';

export interface SongConfig {
  bpm: number;
  beatsPerMeasure: number;
  totalMeasures: number;
  songKey: SongKey;
}
