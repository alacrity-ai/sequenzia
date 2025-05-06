// src/sequencer/matrix/utils/pruneNotesToTimeline.ts

import { Note } from '../../../shared/interfaces/Note.js';

export function pruneNotesToTimeline(notes: Note[], totalBeats: number): Note[] {
    return notes
      .filter(note => note.start < totalBeats)
      .map(note => {
        const maxEnd = totalBeats;
        const adjustedDuration = Math.min(note.duration, maxEnd - note.start);
        return { ...note, duration: adjustedDuration };
      });
}
  