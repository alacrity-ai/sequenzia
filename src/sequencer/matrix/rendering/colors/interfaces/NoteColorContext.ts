// src/sequencer/matrix/rendering/colors/interfaces/NoteColorContext.ts

import type { Note } from '../../../../interfaces/Note.js';

export interface NoteColorContext {
  getPitchClass?: (pitch: string) => number;
  getTrackColor?: () => string;
}

export type NoteColorFunction = (note: Note, context?: NoteColorContext) => string;
