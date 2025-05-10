// src/components/sequencer/matrix/interfaces/GridEvents.ts

import type { Note } from '@/shared/interfaces/Note.js';

export type GridEvents = {
  notePlaced: Note;
  noteDeleted: Note;
  selectionChanged: Note[];
};
