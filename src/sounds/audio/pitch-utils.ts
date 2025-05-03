// src/audio/pitch-utils.ts

const A4_MIDI = 69;
const A4_FREQ = 440;

const semitoneBase: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

function accidentalToSemitones(accidental: string): number {
  return [...accidental].reduce((acc, ch) => {
    if (ch === '#') return acc + 1;
    if (ch === 'b') return acc - 1;
    return acc;
  }, 0);
}

interface ParsedNote {
  midi: number;
  pitchClass: string;
  octave: number;
}

// Normalize enharmonic spelling and return parsed object
function parseNoteToMidi(note: string | null | undefined): ParsedNote | null {
  const match = note?.match(/^([A-Ga-g])([#b]*)(-?\d+)$/);
  if (!match) return null;

  const [, base, accidental, octaveStr] = match;
  const normalizedBase = base.toUpperCase();
  const octave = parseInt(octaveStr, 10);

  const semitoneOffset = semitoneBase[normalizedBase] + accidentalToSemitones(accidental);
  const midi = 12 * (octave + 1) + semitoneOffset;

  return {
    midi,
    pitchClass: normalizedBase + accidental,
    octave
  };
}

export function noteToMidi(note: string): number | null {
  const parsed = parseNoteToMidi(note);
  return parsed ? parsed.midi : null;
}

export function noteToFrequency(
  note: string,
  config: { useEqualTemperament?: boolean } = { useEqualTemperament: true }
): number | null {
  const parsed = parseNoteToMidi(note);
  if (!parsed) return null;

  const { midi, pitchClass } = parsed;
  const semitoneDiff = midi - A4_MIDI;

  if (config.useEqualTemperament) {
    return A4_FREQ * Math.pow(2, semitoneDiff / 12);
  }

  const centsOffset = WELL_TEMPERAMENT_OFFSETS[pitchClass] || 0;
  const tuningAdjustment = Math.pow(2, centsOffset / 1200);
  return A4_FREQ * Math.pow(2, semitoneDiff / 12) * tuningAdjustment;
}

const NOTE_TO_MIDI: Record<string, number> = {
  'C': 0,  'C#': 1,  'Db': 1,
  'D': 2,  'D#': 3,  'Eb': 3,
  'E': 4,  'Fb': 4,  'E#': 5,
  'F': 5,  'F#': 6,  'Gb': 6,
  'G': 7,  'G#': 8,  'Ab': 8,
  'A': 9,  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

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

/**
 * Converts a pitch string (e.g., "C4") to a row index in an inverted piano roll.
 * @param pitch - Pitch name like "C4", "D#5"
 * @param lowestMidi - MIDI value at the bottom row (e.g., 21 for A0)
 * @param totalRows - Total vertical rows in grid (e.g., 88)
 * @returns Row index (0 = top, increasing downward), or null if pitch is out of range
 */
export function pitchToInvertedRow(pitch: string, lowestMidi: number, totalRows: number): number | null {
  const midi = pitchToMidi(pitch);
  if (midi == null) return null;

  const maxMidi = lowestMidi + totalRows - 1;
  if (midi < lowestMidi || midi > maxMidi) return null;

  return totalRows - 1 - (midi - lowestMidi);
}

const SEMIS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMIS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function midiToPitch(midi: number, preferFlats = false): string {
  const semis = preferFlats ? SEMIS_FLAT : SEMIS_SHARP;
  const pitchClass = semis[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass}${octave}`;
}

/**
 * Converts a vertical row index into a pitch string, using an inverted piano roll.
 * @param row - Vertical grid row index (0 = top)
 * @param lowestMidi - MIDI value at the bottom row (e.g., 21 for A0)
 * @param totalRows - Total vertical rows in grid (e.g., 88 for standard keyboard)
 */
export function invertedRowToPitch(row: number, lowestMidi: number, totalRows: number): string {
  const inverted = totalRows - 1 - row;
  const midi = lowestMidi + inverted;
  return midiToPitch(midi);
}

export function getPitchClass(pitch: string): string {
  return pitch.replace(/\d+$/, '');
}

export function isBlackKey(pitch: string): boolean {
  return pitch.includes('#');
}

const WELL_TEMPERAMENT_OFFSETS: Record<string, number> = {
  'C': -14,
  'C#': -2,
  'D': -4,
  'D#': 2,
  'E': -6,
  'F': -10,
  'F#': -2,
  'G': -4,
  'G#': 2,
  'A': 0,
  'A#': 4,
  'B': -2
};