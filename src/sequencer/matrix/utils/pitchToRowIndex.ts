// src/sequencer/matrix/utils/pitchToRowIndex.ts

import { pitchToMidi } from '../../../sounds/audio/pitch-utils.js';

/**
 * Converts a pitch like "C4" to a vertical grid row index.
 * Assumes row 0 is the lowest MIDI note to display (e.g., A0 = 21).
 *
 * @param pitch - Musical pitch string (e.g., "C4", "A#3")
 * @param lowestMidi - Lowest MIDI note in the grid (default A0 = 21)
 * @returns Row index (0-based) or null if pitch is invalid
 */
export function pitchToRowIndex(pitch: string, lowestMidi: number = 21): number | null {
  const midi = pitchToMidi(pitch);
  if (midi === null) return null;
  return midi - lowestMidi;
}
