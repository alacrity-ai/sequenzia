import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';
import type { ExtractedRemiBeforeAfterContext } from '@/components/aimode/interfaces/ExtractedRemiBeforeAfterContext.js';

import { remiEncode } from '@/shared/utils/musical/remi/remiUtils.js';

/**
 * Extracts a context window around targetBeat, split into before/after REMI event streams.
 */
export function extractRemiBeforeAfterContext(
  notes: Note[],
  targetBeat: number,
  contextBeats: number,
  remiSettings: RemiEncodeOptions
): ExtractedRemiBeforeAfterContext {
  const beforeCandidates = notes.filter(n => n.start + n.duration <= targetBeat);
  const afterCandidates = notes.filter(n => n.start >= targetBeat);

  const sortedBefore = beforeCandidates.sort(
    (a, b) => Math.abs(a.start - targetBeat) - Math.abs(b.start - targetBeat)
  );

  const sortedAfter = afterCandidates.sort(
    (a, b) => Math.abs(a.start - targetBeat) - Math.abs(b.start - targetBeat)
  );

  const beforeNotes: Note[] = [];
  const afterNotes: Note[] = [];

  let accumulatedBeats = 0;
  let bi = 0, ai = 0;

  while (accumulatedBeats < contextBeats && (bi < sortedBefore.length || ai < sortedAfter.length)) {
    if (bi < sortedBefore.length) {
      const note = sortedBefore[bi++];
      beforeNotes.push(note);
      accumulatedBeats += note.duration;
      if (accumulatedBeats >= contextBeats) break;
    }

    if (ai < sortedAfter.length) {
      const note = sortedAfter[ai++];
      afterNotes.push(note);
      accumulatedBeats += note.duration;
    }
  }

  beforeNotes.sort((a, b) => a.start - b.start);

  return {
    beforeRemi: remiEncode(beforeNotes, remiSettings),
    afterRemi: remiEncode(afterNotes, remiSettings)
  };
}
