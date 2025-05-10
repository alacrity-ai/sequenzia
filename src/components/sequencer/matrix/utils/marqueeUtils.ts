// src/sequencer/matrix/utils/marqueeUtils.ts

import { noteToRowIndex } from '@/shared/utils/musical/noteUtils.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridSnappingContext } from '../interfaces/GridSnappingContext.js';
import type { Note } from '@/shared/interfaces/Note.js';

interface MarqueeSelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * Returns all notes within the given marquee selection box.
 */
export function getNotesInMarquee(
    notes: Note[],
    box: MarqueeSelectionBox,
    _scroll: GridScroll, // still passed for signature compatibility
    config: GridConfig,
    grid: GridSnappingContext
  ): Note[] {
    const {
      layout: {
        baseCellWidth,
        verticalCellRatio,
        lowestMidi,
        highestMidi,
      },
      behavior: { zoom }
    } = config;
  
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
  
    // No scroll offsets here — already in grid-local space
    const x1 = Math.min(box.startX, box.currentX + cellWidth / 2);
    const x2 = Math.max(box.startX, box.currentX + cellWidth / 2);
    const y1 = Math.min(box.startY, box.currentY);
    const y2 = Math.max(box.startY, box.currentY);
  
    const snap = grid.getSnapResolution();
    const startBeat = Math.floor(x1 / cellWidth / snap) * snap;
    const endBeat = Math.floor(x2 / cellWidth / snap) * snap;
  
    const rowStart = Math.floor(y1 / cellHeight);
    const rowEnd = Math.floor(y2 / cellHeight);
  
    const topRow = Math.min(rowStart, rowEnd);
    const bottomRow = Math.max(rowStart, rowEnd);
  
    return notes.filter(note => {
      const row = noteToRowIndex(note.pitch, lowestMidi, highestMidi);
      if (row == null) return false;
  
      const inRowRange = row >= topRow && row <= bottomRow;
      const noteEnd = note.start + note.duration;
      const inTimeRange = note.start >= startBeat && noteEnd <= endBeat;
  
      return inRowRange && inTimeRange;
    });
  }
  
