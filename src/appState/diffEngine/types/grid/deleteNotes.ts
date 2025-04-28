// src/appState/diffEngine/types/grid/deleteNotes.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';
import { Note } from '../../../../sequencer/interfaces/Note.js';
import { drawGlobalMiniContour } from '../../../../sequencer/grid/drawing/mini-contour.js';
import { sequencers } from '../../../../setup/sequencers.js';

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

  // ✅ Refresh global mini contour (using LIVE sequencers array)
  const globalMiniCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (globalMiniCanvas) {
    drawGlobalMiniContour(globalMiniCanvas, sequencers);
  }

  return newState;
}

/**
 * Creates a forward diff to delete notes.
 */
export function createDeleteNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'DELETE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff to re-place the deleted notes.
 */
export function createReverseDeleteNotesDiff(sequencerId: string, notes: Note[]): Diff {
  return {
    type: 'PLACE_NOTES',
    sequencerId,
    notes: structuredClone(notes),
  };
}
