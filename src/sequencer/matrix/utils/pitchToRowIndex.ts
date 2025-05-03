// src/sequencer/matrix/utils/pitchToRowIndex.ts

import { pitchToMidi } from '../../../sounds/audio/pitch-utils.js';

/**
 * Converts a pitch like "C4" to a vertical grid row index.
 * Inverts the result so that row 0 is the highest pitch and the largest index is the lowest.
 *
 * @param pitch - Musical pitch string (e.g., "C4", "A#3")
 * @param lowestMidi - Lowest MIDI note in the grid (e.g., A0 = 21)
 * @param totalRows - Total number of pitch rows in the grid
 * @returns Row index (0-based, top is highest pitch) or null if pitch is invalid
 */
export function pitchToRowIndex(
  pitch: string,
  lowestMidi: number = 21,
  totalRows: number
): number | null {
  const midi = pitchToMidi(pitch);
  if (midi === null) return null;

  const unflippedIndex = midi - lowestMidi;
  const flippedIndex = totalRows - 1 - unflippedIndex;
  return flippedIndex >= 0 && flippedIndex < totalRows ? flippedIndex : null;
}
