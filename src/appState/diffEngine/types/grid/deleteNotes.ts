// src/appState/diffEngine/types/grid/deleteNotes.ts

import { setAutoCompleteTargetAfterDeletion } from '@/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetAfterDeletion.js';
import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a DELETE_NOTES diff to remove notes from a sequencer.
 */
export function applyDELETE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  const toDelete = new Set(
    (diff.notes as Note[]).map((n: Note) => `${n.pitch}|${n.start}|${n.duration}`)
  );

  seq.notes = seq.notes.filter((n: Note) => {
    const key = `${n.pitch}|${n.start}|${n.duration}`;
    return !toDelete.has(key);
  });

  // === Update AutoCompleteTargetBeat ===
  setAutoCompleteTargetAfterDeletion(diff.notes as Note[], seq.notes);

  return newState;
}

/**
 * Creates a forward diff to delete notes.
 */
export function createDeleteNotesDiff(sequencerId: number, notes: Note[]): Diff {
  return {
    type: 'DELETE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to re-place the deleted notes.
 */
export function createReverseDeleteNotesDiff(sequencerId: number, notes: Note[]): Diff {
  return {
    type: 'PLACE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}
