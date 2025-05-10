// src/appState/diffEngine/types/grid/cutNotes.ts

import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a CUT_NOTES diff to remove notes from a sequencer.
 */
export function applyCUT_NOTES(state: AppState, diff: Diff): AppState {
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

  return newState;
}

/**
 * Creates a forward diff to cut notes.
 */
export function createCutNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'CUT_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to re-place the cut notes.
 */
export function createReverseCutNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'PLACE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}
