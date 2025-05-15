// src/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetFromNotes.ts

import type { Note } from '@/shared/interfaces/Note.js';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';

/**
 * Sets the autoCompleteTargetBeat based on the furthest forward end position
 * of the provided notes (start + duration).
 *
 * @param notes - The notes being placed/moved/resized.
 */
export function setAutoCompleteTargetFromNotes(notes: Note[]): void {
  if (notes.length === 0) return;

  const furthestEnd = Math.max(...notes.map(n => n.start + n.duration));
  setAutoCompleteTargetBeat(furthestEnd);
}
