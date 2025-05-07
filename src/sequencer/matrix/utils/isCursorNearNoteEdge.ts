// src/sequencer/matrix/utils/isCursorNearNoteEdge.ts

import type { Note } from '../../../shared/interfaces/Note.js';

/**
 * Determines if the cursor is near the right edge of a given note.
 * @param beat - Cursor's snapped beat position (from snapping)
 * @param note - The note to test
 * @param threshold - Proximity threshold as a fraction of the note duration (default = 0.25)
 * @returns true if cursor is within the rightmost threshold of the note's duration
 */
export function isCursorNearNoteEdge(
  beat: number,
  note: Note,
  threshold: number = 0.25
): boolean {
  const edgeStart = note.start + note.duration * (1 - threshold);
  return beat >= edgeStart && beat <= note.start + note.duration;
}
