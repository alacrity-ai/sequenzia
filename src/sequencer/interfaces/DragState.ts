// src/sequencer/interfaces/DragState.ts

import { Note } from './Note.js';

export interface DragState {
  startX: number;
  startY: number;
  anchorNote: Note;
  initialNotes: {
    note: Note;
    start: number;
    midi: number;
    velocity?: number;
  }[];
  lastPreviewPitch?: string;
}
