import type Sequencer from '@/sequencer/sequencer.js';
import { getPitchClass } from '@/shared/utils/musical/noteUtils.js';

/**
 * Extracts a de-duplicated set of pitch classes sounding at a given beat.
 *
 * @param sequencers - Array of sequencer objects
 * @param beat - The target beat
 * @param windowSize - Number of beats to consider (default = 1)
 * @param driftTolerance - Lookahead/back buffer in beats (default = 0)
 * @returns A Set of pitch classes (e.g. Set { 'C', 'E', 'G' })
 */
export function getPitchClassesAtBeat(
  sequencers: Sequencer[],
  beat: number,
  windowSize = 1,
  driftTolerance = 0
): Set<string> {
  const start = beat - driftTolerance;
  const end = beat + windowSize + driftTolerance;

  const result = new Set<string>();

  for (const sequencer of sequencers) {
    const notes = sequencer.matrix?.notes ?? [];
    for (const note of notes) {
      const noteEnd = note.start + note.duration;
      const overlaps = noteEnd > start && note.start < end;
      if (overlaps) {
        result.add(getPitchClass(note.pitch));
      }
    }
  }

  return result;
}
