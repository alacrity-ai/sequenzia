import { Note } from './Note.js';

export interface Clipboard {
  notes: Note[];
  anchorBeat: number;
  anchorMidi: number;
}
