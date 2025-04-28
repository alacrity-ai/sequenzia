// src/appState/diffEngine/types/grid/resizeNotes.ts

import { AppState } from '../../../interfaces/AppState.js';
import { Diff } from '../../../interfaces/Diff.js';
import { drawGlobalMiniContour } from '../../../../sequencer/grid/drawing/mini-contour.js';
import { sequencers } from '../../../../setup/sequencers.js';

/**
 * Local interface for a note resize operation.
 */
interface ResizeEntry {
  pitch: string;
  start: number;
  newDuration: number;
}

/**
 * Applies a RESIZE_NOTES diff to update note durations.
 */
export function applyRESIZE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  const resizes = diff.resizes as ResizeEntry[];

  for (const resize of resizes) {
    const note = seq.notes.find(n => n.pitch === resize.pitch && n.start === resize.start);
    if (note) {
      note.duration = resize.newDuration;
    }
  }

  // ✅ Refresh global mini contour properly (use live sequencers)
  const globalMiniCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (globalMiniCanvas) {
    drawGlobalMiniContour(globalMiniCanvas, sequencers);
  }

  return newState;
}

/**
 * Creates a forward diff to resize notes.
 */
export function createResizeNotesDiff(sequencerId: string, resizes: ResizeEntry[]): Diff {
  return {
    type: 'RESIZE_NOTES',
    sequencerId,
    resizes: structuredClone(resizes),
  };
}

/**
 * Creates a reverse diff to restore old note durations.
 */
export function createReverseResizeNotesDiff(
  sequencerId: string,
  resizes: Array<{ pitch: string; start: number; oldDuration: number }>
): Diff {
  const reverseResizes = resizes.map(r => ({
    pitch: r.pitch,
    start: r.start,
    newDuration: r.oldDuration,
  }));

  return {
    type: 'RESIZE_NOTES',
    sequencerId,
    resizes: reverseResizes,
  };
}
