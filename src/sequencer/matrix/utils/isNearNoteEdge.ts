// src/sequencer/matrix/utils/isNearNoteRightEdge.ts

import type { Note } from '../../interfaces/Note.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

/**
 * Determines if the mouse is near the right edge of a note (within threshold).
 */
export function isNearNoteRightEdge(
  mouseX: number,
  note: Note,
  config: GridConfig,
  zoom: number,
  thresholdPx: number = 4
): boolean {
  const cellWidth = config.layout.baseCellWidth * zoom;
  const noteEndPx = (note.start + note.duration) * cellWidth;

  return Math.abs(mouseX - noteEndPx) <= thresholdPx;
}
