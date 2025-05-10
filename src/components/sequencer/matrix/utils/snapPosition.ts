// src/sequencer/matrix/utils/snapPosition.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { SnappedNotePosition } from '../interfaces/SnappedNotePosition.js';

/**
 * Converts raw mouse pixel coordinates into a snapped note position (beat + row).
 * @param mouse - { x, y } in canvas-relative pixels
 * @param scroll - GridScroll instance
 * @param config - GridConfig with layout and zoom information
 * @param snapResolution - e.g. 0.25 for 16th notes
 * @param triplet - If true, interprets snap resolution in triplet context
 * @returns SnappedNotePosition or null if outside grid bounds
 */
export function getSnappedNotePosition(
  mouse: { x: number; y: number },
  scroll: GridScroll,
  config: GridConfig,
  snapResolution: number,
  triplet: boolean = false
): SnappedNotePosition | null {
  const {
    layout: { labelWidth, headerHeight, baseCellWidth, verticalCellRatio, highestMidi, lowestMidi },
    behavior: { zoom }
  } = config;

  const totalRows = highestMidi - lowestMidi + 1;
  const cellWidth = baseCellWidth * zoom;
  const cellHeight = cellWidth / verticalCellRatio;

  const beatX = (mouse.x + scroll.getX() - labelWidth) / cellWidth;
  const rowY = Math.floor((mouse.y + scroll.getY() - headerHeight) / cellHeight);

  // Adjust for triplets: shrink resolution by 2/3
  const effectiveSnap = triplet ? snapResolution * (2 / 3) : snapResolution;
  const snappedX = Math.floor(beatX / effectiveSnap) * effectiveSnap;

  if (snappedX >= 0 && rowY >= 0 && rowY < totalRows) {
    return { x: snappedX, y: rowY };
  }
  return null;
}
