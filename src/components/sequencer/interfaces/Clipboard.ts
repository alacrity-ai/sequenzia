// src/components/sequencer/interfaces/Clipboard.ts

import { Note } from '@/shared/interfaces/Note.js';

export interface Clipboard {
  notes: Note[];
  anchorBeat: number;
  anchorMidi: number;
}
