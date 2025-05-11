// src/shared/utils/musical/tonal/songKeyNotes.ts

import { Scale } from "@tonaljs/tonal";
import type { SongKey, Letter, Mode } from "@/shared/types/SongKey.js";

const VALID_LETTERS: Set<Letter> = new Set([
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'E#', 'Fb',
  'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb',
  'B', 'B#', 'Cb',
]);

const VALID_MODES: Set<Mode> = new Set(['M', 'm']);

/**
 * Converts a SongKey (e.g., "C#m", "BbM") into a list of pitch classes.
 * Returns an array of note names, e.g., ["C", "D", "E", "F", "G", "A", "B"] for "CM".
 *
 * @param key - A valid SongKey in the format `${Letter}${Mode}`
 * @returns An array of pitch classes in the scale, or null if the key is invalid
 */
export function getNotesForSongKey(key: SongKey): string[] | null {
  const letter = key.slice(0, -1) as string;
  const mode = key.slice(-1) as string;

  if (!VALID_LETTERS.has(letter as Letter)) return null;
  if (!VALID_MODES.has(mode as Mode)) return null;

  const modeFull = mode === "M" ? "major" : "minor";
  const scale = Scale.get(`${letter} ${modeFull}`);

  if (scale.empty) return null;

  return scale.notes;
}
