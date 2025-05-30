import { Chord } from '@tonaljs/tonal';
import type { Note } from '@/shared/interfaces/Note.js';
import type { DetectedChord } from '@/shared/interfaces/Chord.js';
import { getPitchClass } from '@/shared/utils/musical/noteUtils';

/**
 * Strips overly specific modifiers like "no5", "no3", "add9" from chord symbols.
 * Useful to simplify chord vocabulary for AI and UI use.
 */
function normalizeChordSymbol(symbol: string): string {
  return symbol
    .replace(/no[35]/gi, '')
    .replace(/add\d+/gi, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Given an array of Note objects, extract pitch classes and detect the most likely chord.
 * Returns structured chord metadata or null if no match found.
 *
 * @param notes - Array of Note objects
 */
export function detectChordFromNotes(notes: Note[]): DetectedChord | null {
  const pitchClasses = Array.from(
    new Set(notes.map(n => getPitchClass(n.pitch)))
  );

  const detected = Chord.detect(pitchClasses);
  if (!detected || detected.length === 0) return null;

  const bestSymbol = detected[0];
  const chord = Chord.get(bestSymbol);
  if (chord.empty) return null;

  return {
    name: chord.name,
    symbol: normalizeChordSymbol(chord.symbol),
    type: chord.type,
    quality: chord.quality,
    notes: chord.notes,
  };
}
