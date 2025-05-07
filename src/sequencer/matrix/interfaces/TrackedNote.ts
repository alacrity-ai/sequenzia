// src/sequencer/matrix/interfaces/TrackedNote.ts

import { Note } from '../../../shared/interfaces/Note.js';
import { NoteInteractionState } from './NoteInteractionState.js';

export interface TrackedNote {
    note: Note;                      // [pitch, start, duration, velocity]
    state: NoteInteractionState;    // UI flags
}
