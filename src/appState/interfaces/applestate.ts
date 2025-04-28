// src/appState/interfaces/AppState.ts

import { Note } from '../../sequencer/interfaces/Note.js';
import { GridConfig } from '../../sequencer/interfaces/GridConfig.js';

export interface SequencerState {
  id: number;
  instrument: string;
  notes: Note[];
}

export interface AppState {
  tempo: number;
  timeSignature: [number, number];
  totalMeasures: number;
  sequencers: SequencerState[];
}

export interface CreateSequencerOptions {
  id: number;
  config: GridConfig;
  notes: Note[];
  instrument: string;
}
