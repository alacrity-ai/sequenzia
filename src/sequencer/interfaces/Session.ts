// src/sequencer/interfaces/Session.ts

import { TrackData } from './Track.js';

export interface Session {
  globalConfig: {
    bpm: number;
    beatsPerMeasure: number;
    totalMeasures: number;
  };
  tracks: TrackData[];
}
