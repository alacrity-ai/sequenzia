import type { Note } from '@/shared/interfaces/Note.js';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';

/**
 * Sets the autoCompleteTargetBeat after a deletion operation.
 * Finds the nearest existing note before the deleted notes and sets the target beat.
 *
 * @param deletedNotes - The notes that were just deleted.
 * @param remainingNotes - All remaining notes in the sequencer after deletion.
 */
export function setAutoCompleteTargetAfterDeletion(
  deletedNotes: Note[],
  remainingNotes: Note[]
): void {
  if (deletedNotes.length === 0) return;

  // Find the earliest deleted note's start (lower bound of deletion area)
  const deletedStart = Math.min(...deletedNotes.map(n => n.start));

  // Find existing notes that end at/before the deletedStart
  const priorNotes = remainingNotes.filter(n => n.start + n.duration <= deletedStart);

  if (priorNotes.length > 0) {
    // Pick the furthest forward of those prior notes
    const latestPriorNote = priorNotes.reduce((latest, n) => {
      const latestEnd = latest.start + latest.duration;
      const noteEnd = n.start + n.duration;
      return noteEnd > latestEnd ? n : latest;
    });

    const targetBeat = latestPriorNote.start + latestPriorNote.duration;
    setAutoCompleteTargetBeat(targetBeat);
  } else {
    // No prior notes → fallback to beat 0
    setAutoCompleteTargetBeat(0);
  }
}
