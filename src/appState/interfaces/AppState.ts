// src/appState/interfaces/AppState.ts

import { Note } from '@/shared/interfaces/Note.js';
import { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';
import type { SongKey } from '@/shared/types/SongKey.js';

export interface SequencerState {
  id: number;
  instrument: string;
  notes: Note[];
  volume?: number;
  pan?: number;
  collapsed?: boolean;
}

export interface AppState {
  tempo: number;
  timeSignature: [number, number];
  totalMeasures: number;
  sequencers: SequencerState[];
  songKey: SongKey;
  snapResolution: number;
  noteDuration: number;
  isTripletMode: boolean;
  isDottedMode: boolean;
}

export interface CreateSequencerOptions {
  id: number;
  config: SequencerConfig;
  notes: Note[];
  instrument: string;
  volume?: number;
  pan?: number;
  collapsed?: boolean;
}
