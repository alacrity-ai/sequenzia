import type { Note } from '../../../shared/interfaces/Note.js';
import { noteToMidi, midiToPitch } from '../../../shared/utils/musical/noteUtils.js';
import { getTotalBeats } from '../../transport.js';

interface DragTransformOptions {
  originalNotes: Note[];
  anchorNote: Note;
  targetPitch: string;
  targetBeat: number;
  lowestMidi: number;
  highestMidi: number;
}

export function transformDraggedNotes({
  originalNotes,
  anchorNote,
  targetPitch,
  targetBeat,
  lowestMidi,
  highestMidi
}: DragTransformOptions): Note[] {
  const targetMidi = noteToMidi(targetPitch);
  const anchorMidi = noteToMidi(anchorNote.pitch);
  if (targetMidi == null || anchorMidi == null) return [];

  const deltaBeats = targetBeat - anchorNote.start;
  const deltaMidi = targetMidi - anchorMidi;

  const transformedStarts = originalNotes.map(n => n.start + deltaBeats);
  const transformedEnds = originalNotes.map(n => n.start + deltaBeats + n.duration);

  const minStart = Math.min(...transformedStarts);
  const maxEnd = Math.max(...transformedEnds);

  const leftClampShift = Math.min(0, minStart);
  const rightClampShift = Math.max(0, maxEnd - getTotalBeats());
  const clampedDeltaBeats = deltaBeats - leftClampShift - rightClampShift;

  return originalNotes.flatMap(n => {
    const midi = noteToMidi(n.pitch);
    if (midi == null) return [];

    let shiftedMidi = midi + deltaMidi;

    // Clamp vertically
    if (shiftedMidi < lowestMidi) shiftedMidi = lowestMidi;
    if (shiftedMidi > highestMidi) shiftedMidi = highestMidi;

    const newPitch = midiToPitch(shiftedMidi);
    if (!newPitch) return [];

    return [{
      pitch: newPitch,
      start: n.start + clampedDeltaBeats,
      duration: n.duration,
      velocity: n.velocity ?? 100,
    }];
  });
}
