// src/sequencer/matrix/utils/noteUtils.ts


const SEMIS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMIS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const NOTE_TO_MIDI: Record<string, number> = {
    'C': 0,  'C#': 1,  'Db': 1,
    'D': 2,  'D#': 3,  'Eb': 3,
    'E': 4,  'Fb': 4,  'E#': 5,
    'F': 5,  'F#': 6,  'Gb': 6,
    'G': 7,  'G#': 8,  'Ab': 8,
    'A': 9,  'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11, 'B#': 0,
  };
  
  export function isBlackKeyRow(row: number, lowestMidi: number, highestMidi: number): boolean {
    const pitch = rowToNote(row, lowestMidi, highestMidi);
    return pitch != null && isBlackKey(pitch);
  }

  export function isBlackKey(pitch: string): boolean {
    return pitch.includes('#');
  }

  /**
   * Convert a pitch like "C4" or "Eb3" to a MIDI note number (e.g., 60)
   */
  export function pitchToMidi(pitch: string | null | undefined): number | null {
    const match = pitch?.match(/^([A-Ga-g])([#b]*)(-?\d+)$/);
    if (!match) return null;
  
    const [, base, accidentals, octaveStr] = match;
    const normalized = base.toUpperCase();
    const baseSemitone = NOTE_TO_MIDI[normalized];
    if (baseSemitone === undefined) return null;
  
    const accidentalShift = [...accidentals].reduce((acc, char) => {
      if (char === '#') return acc + 1;
      if (char === 'b') return acc - 1;
      return acc;
    }, 0);
  
    const octave = parseInt(octaveStr, 10);
    return 12 * (octave + 1) + (baseSemitone + accidentalShift);
  }

  // Alias for pitchToMidi
  export function noteToMidi(pitch: string | null | undefined): number | null {
    return pitchToMidi(pitch);
  }

  // Function to extract pitch class from a pitch string (e.g., "C4" -> "C")
  export function getPitchClass(pitch: string): string {
    return pitch.replace(/\d+$/, '');
  }

  // Alias for getPitchClass
  export function getNoteClass(note: string): string {
    return getPitchClass(note);
  }

  export const getPitchClassIndex = (pitch: string): number => {
    const midi = pitchToMidi(pitch);
    return midi !== null ? midi % 12 : 0;
  };
  

/**
 * Converts a pitch like "C4" to a vertical grid row index.
 * Inverts the result so that row 0 is the highest pitch and the largest index is the lowest.
 *
 * @param pitch - Musical pitch string (e.g., "C4", "A#3")
 * @param lowestMidi - Lowest MIDI note in the grid (e.g., A0 = 21)
 * @param totalRows - Total number of pitch rows in the grid
 * @returns Row index (0-based, top is highest pitch) or null if pitch is invalid
 */
export function noteToRowIndex(
  pitch: string,
  lowestMidi: number = 21,
  highestMidi: number
): number | null {
  const midi = pitchToMidi(pitch);
  if (midi === null) return null;

  const totalRows = highestMidi - lowestMidi + 1;
  const unflippedIndex = midi - lowestMidi;
  const flippedIndex = totalRows - 1 - unflippedIndex;
  return flippedIndex >= 0 && flippedIndex < totalRows ? flippedIndex : null;
}

/**
 * Converts a vertical row index into a pitch string like "C4" or "A#3", using an inverted piano roll.
 * @param row - Vertical grid row index (0 = top)
 * @param lowestMidi - MIDI value at the bottom row (e.g., 21 for A0)
 * @param totalRows - Total vertical rows in grid (e.g., 88 for standard keyboard)
 */
export function rowToNote(row: number, lowestMidi: number, highestMidi: number): string {
  const totalRows = highestMidi - lowestMidi + 1;
  const inverted = totalRows - 1 - row;
  const midi = lowestMidi + inverted;
  return midiToPitch(midi);
}

// Converts a MIDI note number to a pitch string like "C4" or "A#3"
export function midiToPitch(midi: number, preferFlats = false): string {
  const semis = preferFlats ? SEMIS_FLAT : SEMIS_SHARP;
  const pitchClass = semis[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass}${octave}`;
}

export function computeBlackKeyRowMap(lowestMidi: number, highestMidi: number): boolean[] {
  const totalRows = highestMidi - lowestMidi + 1;
  const map: boolean[] = new Array(totalRows);
  for (let row = 0; row < totalRows; row++) {
    const pitch = rowToNote(row, lowestMidi, highestMidi);
    map[row] = isBlackKey(pitch);
  }
  return map;
}

export function computeBlackKeyMidiMap(lowestMidi: number, highestMidi: number): Map<number, boolean> {
  const map = new Map<number, boolean>();
  for (let midi = lowestMidi; midi <= highestMidi; midi++) {
    map.set(midi, isBlackKey(midiToPitch(midi)));
  }
  return map;
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