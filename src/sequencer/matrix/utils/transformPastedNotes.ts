// src/sequencer/matrix/utils/transformPastedNotes.ts

import type { Note } from '../../../shared/interfaces/Note.js';
import { noteToMidi, midiToPitch } from '../../../shared/utils/musical/noteUtils.js';
import { getTotalBeats } from '../../transport.js';

interface PasteTransformOptions {
  notes: Note[];
  anchorBeat: number;
  anchorMidi: number;
  targetBeat: number;
  targetMidi: number;
  lowestMidi: number;
  highestMidi: number;
}

export function transformPastedNotes({
  notes,
  anchorBeat,
  anchorMidi,
  targetBeat,
  targetMidi,
  lowestMidi,
  highestMidi
}: PasteTransformOptions): Note[] {
  const deltaBeats = targetBeat - anchorBeat;
  const deltaMidi = targetMidi - anchorMidi;

  const projectedStarts = notes.map(n => n.start + deltaBeats);
  const projectedEnds = notes.map(n => n.start + deltaBeats + n.duration);

  const minStart = Math.min(...projectedStarts);
  const maxEnd = Math.max(...projectedEnds);

  const leftClampShift = Math.min(0, minStart);
  const rightClampShift = Math.max(0, maxEnd - getTotalBeats());
  const clampedDeltaBeats = deltaBeats - leftClampShift - rightClampShift;

  return notes.flatMap(n => {
    const sourceMidi = noteToMidi(n.pitch);
    if (sourceMidi == null) return [];

    let shiftedMidi = sourceMidi + deltaMidi;

    // Clamp vertically
    if (shiftedMidi < lowestMidi) shiftedMidi = lowestMidi;
    if (shiftedMidi > highestMidi) shiftedMidi = highestMidi;

    const newPitch = midiToPitch(shiftedMidi);
    if (!newPitch) return [];

    return [{
      pitch: newPitch,
      start: n.start + clampedDeltaBeats,
      duration: n.duration,
      velocity: n.velocity ?? 100
    }];
  });
}
