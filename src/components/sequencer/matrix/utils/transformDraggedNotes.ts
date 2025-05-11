// src/sequencer/matrix/utils/transformDraggedNotes.ts

import type { Note } from '@/shared/interfaces/Note.js';
import { noteToMidi, midiToPitch } from '@/shared/utils/musical/noteUtils.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { isSnapToInKeyEnabled, getMidiNoteMap } from '@/shared/stores/songInfoStore.js';

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

  const transformedStarts = originalNotes.map(n => n.start + deltaBeats);
  const transformedEnds = originalNotes.map(n => n.start + deltaBeats + n.duration);

  const minStart = Math.min(...transformedStarts);
  const maxEnd = Math.max(...transformedEnds);

  const leftClampShift = Math.min(0, minStart);
  const rightClampShift = Math.max(0, maxEnd - getTotalBeats());
  const clampedDeltaBeats = deltaBeats - leftClampShift - rightClampShift;

  const snapToInKey = isSnapToInKeyEnabled();

  if (!snapToInKey) {
    // === Linear chromatic transform (default)
    const deltaMidi = targetMidi - anchorMidi;

    return originalNotes.flatMap(n => {
      const midi = noteToMidi(n.pitch);
      if (midi == null) return [];

      let shiftedMidi = midi + deltaMidi;
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
  } else {
    // === Harmonic in-key transform
    const inKeyMap = getMidiNoteMap();

    // Build ordered array of in-key MIDI notes, top-down
    const inKeyNotes: number[] = [];
    for (let m = highestMidi; m >= lowestMidi; m--) {
      if (inKeyMap.get(m)) inKeyNotes.push(m);
    }

    const anchorIndex = inKeyNotes.indexOf(anchorMidi);
    const targetIndex = inKeyNotes.indexOf(targetMidi);
    if (anchorIndex === -1 || targetIndex === -1) return [];

    const intervalInSteps = targetIndex - anchorIndex;

    return originalNotes.flatMap(n => {
      const midi = noteToMidi(n.pitch);
      if (midi == null) return [];

      const originalIndex = inKeyNotes.indexOf(midi);
      if (originalIndex === -1) return []; // Skip out-of-key notes

      const newIndex = originalIndex + intervalInSteps;
      if (newIndex < 0 || newIndex >= inKeyNotes.length) return [];

      const newMidi = inKeyNotes[newIndex];
      const newPitch = midiToPitch(newMidi);
      if (!newPitch) return [];

      return [{
        pitch: newPitch,
        start: n.start + clampedDeltaBeats,
        duration: n.duration,
        velocity: n.velocity ?? 100,
      }];
    });
  }
}
