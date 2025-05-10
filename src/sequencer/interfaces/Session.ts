// src/sequencer/interfaces/Session.ts

import { TrackData } from './Track.js';
import type { SongKey } from '../../shared/types/SongKey.js';

export interface GlobalConfig {
  bpm: number;
  beatsPerMeasure: number;
  totalMeasures: number;
  songKey: SongKey;
}

export interface Session {
  globalConfig: GlobalConfig;
  tracks: TrackData[];
}
