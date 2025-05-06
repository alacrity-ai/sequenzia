// src/appState/diffEngine/types/grid/placeNotes.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';
import { Note } from '../../../../shared/interfaces/Note.js';

/**
 * Applies a PLACE_NOTES diff to add notes to a sequencer.
 */
export function applyPLACE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  seq.notes.push(...(diff.notes as Note[]));

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
