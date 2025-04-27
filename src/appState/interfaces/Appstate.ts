import { Note } from '../../sequencer/interfaces/Note.js';

export interface SequencerState {
  id: string;
  instrument: string;
  notes: Note[];
}

export interface AppState {
  tempo: number;
  timeSignature: [number, number];
  totalMeasures: number;
  sequencers: SequencerState[];
}
