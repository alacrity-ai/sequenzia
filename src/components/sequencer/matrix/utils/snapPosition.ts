// src/sequencer/matrix/utils/snapPosition.ts

import { isSnapToInKeyEnabled, getMidiNoteMap } from '@/shared/stores/songInfoStore.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { SnappedNotePosition } from '../interfaces/SnappedNotePosition.js';

/**
 * Converts raw mouse pixel coordinates into a snapped note position (beat + row).
 * Supports horizontal snapping to resolution and vertical snapping to in-key MIDI notes.
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
  let rowY = Math.floor((mouse.y + scroll.getY() - headerHeight) / cellHeight);

  const effectiveSnap = triplet ? snapResolution * (2 / 3) : snapResolution;
  const snappedX = Math.floor(beatX / effectiveSnap) * effectiveSnap;

  if (snappedX < 0 || rowY < 0 || rowY >= totalRows) return null;

  // === Optional: Snap vertically to in-key notes
  if (isSnapToInKeyEnabled()) {
    const inKeyMap = getMidiNoteMap();
    const rawMidi = highestMidi - rowY;

    let bestRow: number | null = null;
    let minDistance = Infinity;

    for (let offset = -12; offset <= 12; offset++) {
      const candidateMidi = rawMidi + offset;
      if (candidateMidi < lowestMidi || candidateMidi > highestMidi) continue;
      if (!inKeyMap.get(candidateMidi)) continue;

      const candidateRow = highestMidi - candidateMidi;
      const distance = Math.abs(candidateRow - rowY);

      if (distance < minDistance) {
        minDistance = distance;
        bestRow = candidateRow;
      }

      if (distance === 0) break; // perfect match
    }

    if (bestRow !== null) rowY = bestRow;
  }

  return { x: snappedX, y: rowY };
}
