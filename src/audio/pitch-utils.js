const A4_MIDI = 69;
const A4_FREQ = 440;

const semitoneBase = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

const WELL_TEMPERAMENT_OFFSETS = {
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

// Helper: Convert accidentals to semitone offset
function accidentalToSemitones(accidental) {
  return [...accidental].reduce((acc, ch) => {
    if (ch === '#') return acc + 1;
    if (ch === 'b') return acc - 1;
    return acc;
  }, 0);
}

// Normalize enharmonic spelling and return { midi, pitchClass }
function parseNoteToMidi(note) {
  const match = note.match(/^([A-Ga-g])([#b]*)(\d+)$/);
  if (!match) return null;

  let [, base, accidental, octaveStr] = match;
  base = base.toUpperCase();

  const octave = parseInt(octaveStr, 10);
  const semitoneOffset = semitoneBase[base] + accidentalToSemitones(accidental);
  const normalizedMidi = 12 * octave + semitoneOffset;

  return {
    midi: normalizedMidi,
    pitchClass: base + accidental,
    octave
  };
}

export function noteToMidi(note) {
  const parsed = parseNoteToMidi(note);
  return parsed ? parsed.midi : null;
}

export function noteToFrequency(note, config = { useEqualTemperament: true }) {
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

const NOTE_TO_MIDI = {
  'C': 0,  'C#': 1,  'Db': 1,
  'D': 2,  'D#': 3,  'Eb': 3,
  'E': 4,  'Fb': 4,  'E#': 5,
  'F': 5,  'F#': 6,  'Gb': 6,
  'G': 7,  'G#': 8,  'Ab': 8,
  'A': 9,  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

/**
 * Convert a pitch like "C4" or "Eb3" to MIDI note number (e.g., 60)
 * @param {string} pitch
 * @returns {number|null}
 */
export function pitchToMidi(pitch) {
  const match = pitch.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return null;
  const [, letter, octaveStr] = match;
  const normalized = letter.toUpperCase();
  const semitone = NOTE_TO_MIDI[normalized];
  if (semitone === undefined) return null;

  const octave = parseInt(octaveStr, 10);
  return 12 * (octave + 1) + semitone;
}
