// src/sequencer/grid/helpers/note-finder.ts

import { pitchToMidi } from "../../../sounds/audio/pitch-utils";

export function findNoteAt(
  x: number,
  y: number,
  notes: { pitch: string; start: number; duration: number }[],
  getPitchRow: (pitch: string) => number,
  cellHeight: number,
  cellWidth: number
): { pitch: string; start: number; duration: number } | undefined {
  const row = Math.floor(y / cellHeight);
  const beat = x / cellWidth;

  return notes.find(n =>
    beat >= n.start &&
    beat < n.start + n.duration &&
    getPitchRow(n.pitch) === row
  );
}

/**
 * Computes the MIDI interval between two pitch strings, throwing if invalid.
 * @param highPitch Higher pitch (e.g., "B9")
 * @param lowPitch Lower pitch (e.g., "C1")
 * @returns Difference in semitones
 */
export function midiRangeBetween(highPitch: string, lowPitch: string): number {
  const high = pitchToMidi(highPitch);
  const low = pitchToMidi(lowPitch);

  if (high === null || low === null) {
    throw new Error(`Invalid pitches provided: ${highPitch}, ${lowPitch}`);
  }

  return high - low;
}