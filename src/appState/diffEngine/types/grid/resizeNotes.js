// src/appState/diffEngine/types/grid/resizeNotes.js

import { drawGlobalMiniContour } from "../../../../sequencer/mini-contour";
import { sequencers } from "../../../../setup/sequencers";

/**
 * Applies a RESIZE_NOTES diff to the app state.
 * This adjusts the duration of existing notes without altering their start time.
 */
export function applyRESIZE_NOTES(state, diff) {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  for (const resize of diff.resizes) {
    const note = seq.notes.find(n => n.pitch === resize.pitch && n.start === resize.start);
    if (note) {
      note.duration = resize.newDuration;
    }
  }

  // Refresh global mini contour after resizing notes
  const globalMiniCanvas = document.getElementById('global-mini-contour');
  if (globalMiniCanvas) {
    drawGlobalMiniContour(globalMiniCanvas, sequencers);
  }

  return newState;
}

/**
 * Creates a forward diff for resizing notes.
 * @param {string} sequencerId 
 * @param {Array<{pitch: string, start: number, newDuration: number}>} resizes 
 */
export function createResizeNotesDiff(sequencerId, resizes) {
  return {
    type: 'RESIZE_NOTES',
    sequencerId,
    resizes: structuredClone(resizes)
  };
}

/**
 * Creates a reverse diff for resizing notes.
 * This captures the previous (old) durations to allow undo.
 * @param {string} sequencerId 
 * @param {Array<{pitch: string, start: number, oldDuration: number}>} resizes 
 */
export function createReverseResizeNotesDiff(sequencerId, resizes) {
  // For reverse, we simply flip back to the old durations
  const reverseResizes = resizes.map(r => ({
    pitch: r.pitch,
    start: r.start,
    newDuration: r.oldDuration
  }));

  return {
    type: 'RESIZE_NOTES',
    sequencerId,
    resizes: reverseResizes
  };
}

