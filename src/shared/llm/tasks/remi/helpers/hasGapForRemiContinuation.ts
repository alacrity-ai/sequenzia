import type Sequencer from '@/components/sequencer/sequencer.js';

import { devLog } from '@/shared/state/devMode.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';

/**
 * Determines if there is sufficient empty space in the sequencer to perform a REMI continuation.
 * This checks for note collisions AND ensures we do not exceed song length.
 *
 * @param sequencer - The sequencer to analyze.
 * @param fromBeat - The beat position from which continuation would begin.
 * @param continuationBeats - The length (in beats) of the desired continuation.
 * @returns True if there is enough gap, false if the space is occupied or exceeds song length.
 */
export function hasGapForRemiContinuation(
  sequencer: Sequencer,
  fromBeat: number,
  continuationBeats: number
): boolean {
  const notes = sequencer.notes;
  const totalBeats = getTotalBeats();

  // Reject if continuation would exceed song length
  if (fromBeat >= totalBeats) {
    devLog('[AutoComplete] fromBeat is at or beyond song end. No space for continuation.');
    return false;
  }

  const toBeat = Math.min(fromBeat + continuationBeats, totalBeats);

  // Check for note collisions in [fromBeat, toBeat)
  const hasCollision = notes.some(note => {
    const noteStart = note.start;
    const noteEnd = note.start + note.duration;

    // Overlaps if note starts before toBeat and ends after fromBeat
    return noteStart < toBeat && noteEnd > fromBeat;
  });

  return !hasCollision;
}
