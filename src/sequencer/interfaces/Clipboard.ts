import { Note } from '../../shared/interfaces/Note.js';

export interface Clipboard {
  notes: Note[];
  anchorBeat: number;
  anchorMidi: number;
}
