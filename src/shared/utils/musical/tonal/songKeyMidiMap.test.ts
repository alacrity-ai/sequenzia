// src/shared/utils/musical/tonal/songKeyMidiMap.test.ts

// npm run test -- src/shared/utils/musical/tonal/songKeyMidiMap.test.ts

import { describe, it, expect } from 'vitest';
import { getMidiNoteMapForKey } from './songKeyMidiMap';
import { NOTE_TO_MIDI } from '@/shared/utils/musical/noteUtils';
import type { SongKey } from '@/shared/types/SongKey';

function extractPitchClasses(midiMap: Map<number, boolean>): number[] {
  const included = [];
  for (let midi = 0; midi <= 127; midi++) {
    if (midiMap.get(midi)) {
      included.push(midi % 12);
    }
  }
  return Array.from(new Set(included)).sort((a, b) => a - b);
}

describe('getMidiNoteMapForKey', () => {
  it('returns correct pitch classes for CM (C major)', () => {
    const midiMap = getMidiNoteMapForKey('CM');
    const expected = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => NOTE_TO_MIDI[n] % 12);
    const actual = extractPitchClasses(midiMap);
    expect(actual).toEqual(expected.sort((a, b) => a - b));
  });

  it('returns correct pitch classes for Am (A minor)', () => {
    const midiMap = getMidiNoteMapForKey('Am');
    const expected = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => NOTE_TO_MIDI[n] % 12);
    const actual = extractPitchClasses(midiMap);
    expect(actual).toEqual(expected.sort((a, b) => a - b));
  });

  it('returns correct pitch classes for F#m (F# minor)', () => {
    const midiMap = getMidiNoteMapForKey('F#m');
    const expected = ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'].map(n => NOTE_TO_MIDI[n] % 12);
    const actual = extractPitchClasses(midiMap);
    expect(actual).toEqual(expected.sort((a, b) => a - b));
  });

  it('maps all MIDI numbers 0–127', () => {
    const midiMap = getMidiNoteMapForKey('CM');
    expect(midiMap.size).toBe(128);
    for (let i = 0; i <= 127; i++) {
      expect(midiMap.has(i)).toBe(true);
    }
  });

  it('returns empty map for invalid key', () => {
    const midiMap = getMidiNoteMapForKey('XZ' as SongKey);
    expect(midiMap.size).toBe(0);
  });
});
