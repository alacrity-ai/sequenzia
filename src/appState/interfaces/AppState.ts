// src/appState/interfaces/AppState.ts

import { Note } from '../../shared/interfaces/Note.js';
import { SequencerConfig } from '../../sequencer/interfaces/SequencerConfig.js';
import type { SongKey } from '../../shared/types/SongKey.js';

export interface SequencerState {
  id: number;
  instrument: string;
  notes: Note[];
  volume?: number;
  pan?: number;
}

export interface AppState {
  tempo: number;
  timeSignature: [number, number];
  totalMeasures: number;
  sequencers: SequencerState[];
  songKey: SongKey;
}

export interface CreateSequencerOptions {
  id: number;
  config: SequencerConfig;
  notes: Note[];
  instrument: string;
  volume?: number;
  pan?: number;
}
