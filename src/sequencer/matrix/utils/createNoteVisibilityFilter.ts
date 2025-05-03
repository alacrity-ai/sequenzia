// src/sequencer/matrix/utils/createVisibleNotesFilter.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import { pitchToRowIndex } from './pitchToRowIndex.js';


/**
 * Creates a memoized filter function that returns only visible TrackedNotes
 * based on scroll position and viewport bounds.
 */
export function createVisibleNotesFilter(
  scrollX: number,
  scrollY: number,
  config: GridConfig,
  canvas: HTMLCanvasElement
): (notes: TrackedNote[]) => TrackedNote[] {
  const {
    layout: { baseCellWidth, verticalCellRatio, lowestMidi, totalRows },
    behavior: { zoom },
  } = config;

  const cellWidth = baseCellWidth * zoom;
  const cellHeight = cellWidth / verticalCellRatio;
  const canvasWidth = canvas.offsetWidth;
  const canvasHeight = canvas.offsetHeight;

  const buffer = -1;

  const startX = scrollX / cellWidth - buffer;
  const endX = (scrollX + canvasWidth) / cellWidth + buffer;
  const startRow = Math.floor(scrollY / cellHeight) - buffer;
  const endRow = Math.ceil((scrollY + canvasHeight) / cellHeight) + buffer;

  const pitchRowCache = new Map<string, number>();

  return (notes: TrackedNote[]): TrackedNote[] => {
    return notes.filter(({ note }) => {
      const noteEnd = note.start + note.duration;
      if (noteEnd < startX || note.start > endX) return false;

      let row = pitchRowCache.get(note.pitch);
      if (row == null) {
        const resolved = pitchToRowIndex(note.pitch, lowestMidi, totalRows);
        if (resolved == null || resolved < 0 || resolved >= totalRows) return false;
        row = resolved;
        pitchRowCache.set(note.pitch, row);
      }

      return row >= startRow && row <= endRow;
    });
  };
}
