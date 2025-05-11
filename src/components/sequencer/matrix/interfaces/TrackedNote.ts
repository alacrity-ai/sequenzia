// src/components/sequencer/matrix/interfaces/TrackedNote.ts

import { Note } from '@/shared/interfaces/Note.js';
import { NoteInteractionState } from '@/components/sequencer/matrix/interfaces/NoteInteractionState.js';

export interface TrackedNote {
    note: Note;
    state: NoteInteractionState;
}
