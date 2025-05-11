// src/appState/diffEngine/types/grid/pasteNotes.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a PASTE_NOTES diff to add notes to a sequencer.
 */
export function applyPASTE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  seq.notes.push(...(diff.notes as Note[]));
  return newState;
}

/**
 * Creates a forward diff to paste notes.
 */
export function createPasteNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'PASTE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to delete pasted notes.
 */
export function createReversePasteNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'DELETE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}
