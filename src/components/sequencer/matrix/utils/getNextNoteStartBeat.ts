// src/sequencer/matrix/utils/getNextNoteStartBeat.ts

import type Sequencer from '@/components/sequencer/sequencer.js';

/**
 * Finds the start beat of the next note after a given fromBeat in the sequencer.
 *
 * @param sequencer - The sequencer to analyze.
 * @param fromBeat - The reference beat to search after.
 * @returns The start beat of the next note, or null if none exist.
 */
export function getNextNoteStartBeat(sequencer: Sequencer, fromBeat: number): number | null {
  const notes = sequencer.notes;

  const nextNote = notes
    .filter(note => note.start >= fromBeat)
    .sort((a, b) => a.start - b.start)[0];

  return nextNote ? nextNote.start : null;
}
