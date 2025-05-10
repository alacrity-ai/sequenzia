// src/shared/utils/musical/tonal/songKeyMidiMap.ts

import type { SongKey } from '@/shared/types/SongKey.js';
import type { MidiNoteMap } from '@/shared/interfaces/MidiNoteMap.js';
import { getNotesForSongKey } from './songKeyNotes.js';
import { NOTE_TO_MIDI } from '@/shared/utils/musical/noteUtils.js';

/**
 * Generate a map of all MIDI pitches (0–127) to whether they are in the given key.
 *
 * @param key - The SongKey (e.g., "CM", "EbM", "F#m")
 * @returns A map from MIDI number to in-key status
 */
export function getMidiNoteMapForKey(key: SongKey): MidiNoteMap {
  const pitchClasses = getNotesForSongKey(key);
  const map: MidiNoteMap = new Map();

  if (!pitchClasses) return map;

  const validSemis = new Set<number>(
    pitchClasses.map(p => NOTE_TO_MIDI[p] % 12)
  );

  for (let midi = 0; midi <= 127; midi++) {
    const pitchClass = midi % 12;
    map.set(midi, validSemis.has(pitchClass));
  }

  return map;
}
