// src/appState/diffEngine/types/grid/placeNotes.ts

import { setAutoCompleteTargetFromNotes } from '@/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetFromNotes.js';
import { setLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a PLACE_NOTES diff to add notes to a sequencer.
 */
export function applyPLACE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  seq.notes.push(...(diff.notes as Note[]));

  // === Update AutoCompleteTargetBeat ===
  setAutoCompleteTargetFromNotes(diff.notes as Note[]);

  return newState;
}

/**
 * Creates a forward diff to place notes.
 */
export function createPlaceNotesDiff(sequencerId: number, notes: Note[]): Diff {
  return {
    type: 'PLACE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to delete placed notes.
 */
export function createReversePlaceNotesDiff(sequencerId: number, notes: Note[]): Diff {
  return {
    type: 'DELETE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}
