// src/shared/utils/musical/tonal/chordDetection.test.ts

// npm run test -- src/shared/utils/musical/tonal/chordDetection.test.ts

import { describe, it, expect } from 'vitest';
import { detectChordFromNotes } from './chordDetection';
import type { Note } from '@/shared/interfaces/Note';

function makeNotes(pitches: string[]): Note[] {
  return pitches.map(pitch => ({
    pitch,
    start: 0,
    duration: 1,
  }));
}

describe('detectChordFromNotes', () => {
  it('detects a C major triad', () => {
    const notes = makeNotes(['C4', 'E4', 'G4']);
    const chord = detectChordFromNotes(notes);
    expect(chord?.symbol).toBe('CM'); // not 'C'
    expect(chord?.quality).toBe('Major');
  });

  it('detects a D7 chord', () => {
    const notes = makeNotes(['D4', 'F#4', 'A4', 'C5']);
    const chord = detectChordFromNotes(notes);
    expect(chord?.symbol).toBe('D7');
    expect(chord?.quality).toBe('Major'); // dominant chords are triad-major in Tonal
  });

  it('detects an F minor chord', () => {
    const notes = makeNotes(['F3', 'Ab3', 'C4']);
    const chord = detectChordFromNotes(notes);
    expect(chord?.symbol).toBe('Fm');
    expect(chord?.quality).toBe('Minor');
  });


  it('returns null for an ambiguous or atonal cluster', () => {
    const notes = makeNotes(['C4', 'C#4', 'F4']);
    const chord = detectChordFromNotes(notes);
    expect(chord).toBeNull();
  });

  it('deduplicates repeated pitch classes', () => {
    const notes = makeNotes(['C4', 'E4', 'G4', 'C5', 'E5']);
    const chord = detectChordFromNotes(notes);
    expect(chord?.symbol).toBe('CM'); // not 'C'
    expect(chord?.notes).toEqual(expect.arrayContaining(['C', 'E', 'G']));
  });
});

