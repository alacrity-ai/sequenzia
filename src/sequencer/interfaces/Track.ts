// src/sequencer/interfaces/Track.ts

import { Note } from './Note.js';

export interface Track {
  n: Note[];
}

export interface TrackData {
    notes: Note[];
    instrument: string;
    config: { [key: string]: any };
}