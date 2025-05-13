// src/components/aimode/autocomplete/helpers/applyAutoCompleteNotes.ts

import { applyDiff } from '@/appState/diffEngine/applyDiff';
import { createPasteNotesDiff } from '@/appState/diffEngine/types/grid/pasteNotes';
import type { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a list of notes to a sequencer via the diff engine.
 *
 * @param sequencerId - ID of the sequencer to apply notes to.
 * @param notes - List of notes to apply.
 */
export function applyAutoCompleteNotes(sequencerId: number, notes: Note[]): void {
  const diff = createPasteNotesDiff(sequencerId, notes);
  applyDiff(diff);
}
