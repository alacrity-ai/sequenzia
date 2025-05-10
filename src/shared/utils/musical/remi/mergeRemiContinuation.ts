import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import { remiDecode } from '@/shared/utils/musical/remi/remiUtils.js';

/**
 * Merges a generated REMI continuation into the tail of an existing Note[].
 * Ensures time continuity by offsetting all generated notes to follow the original.
 *
 * @param originalNotes The notes already in the sequencer
 * @param continuationTokens The LLM-generated REMI sequence
 * @param options Must match the encoder/decoder config used in both directions
 * @returns A new Note[] with the continuation appended after the original
 */
export function mergeRemiContinuation(
  originalNotes: Note[],
  continuationTokens: RemiEvent[],
  options: { beatsPerBar?: number; stepsPerBeat?: number; quantizeDurations?: boolean } = {}
): Note[] {
  const { beatsPerBar = 4, stepsPerBeat = 4, quantizeDurations = true } = options;

  const generatedNotes = remiDecode(continuationTokens, {
    beatsPerBar,
    stepsPerBeat,
    quantizeDurations
  });

  // Determine end of original melody
  const lastBeat = originalNotes.reduce(
    (max, note) => Math.max(max, note.start + note.duration),
    0
  );

  // Get first beat of generated notes to compute relative offset
  const earliestGenerated = generatedNotes.length > 0
    ? Math.min(...generatedNotes.map(n => n.start))
    : 0;

  const timeOffset = Math.max(0, lastBeat - earliestGenerated);

  // Shift generated notes to follow original
  const shiftedGeneratedNotes = generatedNotes.map(note => ({
    ...note,
    start: note.start + timeOffset
  }));

  return [...originalNotes, ...shiftedGeneratedNotes];
}

/*
const original = [
  { pitch: 'C4', start: 0, duration: 1, velocity: 90 },
  { pitch: 'E4', start: 1, duration: 1, velocity: 90 },
  { pitch: 'G4', start: 2, duration: 1, velocity: 90 }
];

const generatedRemi: RemiEvent[] = [
  { type: 'Bar', value: 1 },
  { type: 'Position', value: 0 },
  { type: 'Pitch', value: 'A4' },
  { type: 'Duration', value: 4 },
  { type: 'Velocity', value: 100 }
];

// full now contains original + continuation, correctly aligned
const full = mergeRemiContinuation(original, generatedRemi);
*/