// src/sequencer/matrix/utils/transformPastedNotes.ts

import type { Note } from '@/shared/interfaces/Note.js';
import { noteToMidi, midiToPitch } from '@/shared/utils/musical/noteUtils.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { isSnapToInKeyEnabled, getMidiNoteMap } from '@/shared/stores/songInfoStore.js';

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

  const projectedStarts = notes.map(n => n.start + deltaBeats);
  const projectedEnds = notes.map(n => n.start + deltaBeats + n.duration);

  const minStart = Math.min(...projectedStarts);
  const maxEnd = Math.max(...projectedEnds);

  const leftClampShift = Math.min(0, minStart);
  const rightClampShift = Math.max(0, maxEnd - getTotalBeats());
  const clampedDeltaBeats = deltaBeats - leftClampShift - rightClampShift;

  const snapToInKey = isSnapToInKeyEnabled();

  if (!snapToInKey) {
    // === Chromatic paste (default)
    const deltaMidi = targetMidi - anchorMidi;

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
  } else {
    // === Harmonic in-key paste
    const inKeyMap = getMidiNoteMap();

    const inKeyNotes: number[] = [];
    for (let m = highestMidi; m >= lowestMidi; m--) {
      if (inKeyMap.get(m)) inKeyNotes.push(m);
    }

    const anchorIndex = inKeyNotes.indexOf(anchorMidi);
    const targetIndex = inKeyNotes.indexOf(targetMidi);
    if (anchorIndex === -1 || targetIndex === -1) return [];

    const intervalInSteps = targetIndex - anchorIndex;

    return notes.flatMap(n => {
      const sourceMidi = noteToMidi(n.pitch);
      if (sourceMidi == null) return [];

      const originalIndex = inKeyNotes.indexOf(sourceMidi);
      if (originalIndex === -1) return []; // Exclude out-of-key original notes

      const newIndex = originalIndex + intervalInSteps;
      if (newIndex < 0 || newIndex >= inKeyNotes.length) return [];

      const newMidi = inKeyNotes[newIndex];
      const newPitch = midiToPitch(newMidi);
      if (!newPitch) return [];

      return [{
        pitch: newPitch,
        start: n.start + clampedDeltaBeats,
        duration: n.duration,
        velocity: n.velocity ?? 100
      }];
    });
  }
}
