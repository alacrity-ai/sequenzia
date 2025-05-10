// src/shared/utils/musical/detectChordsFromSequencers.test.ts

// npm run test -- src/shared/utils/musical/detectChordsFromSequencers.test.ts

import { describe, it, expect } from 'vitest';
import type { Note } from '@/shared/interfaces/Note';
import type Sequencer from '@/components/sequencer/sequencer.js';

import { getPitchClassesAtBeat } from './getPitchClassesAtBeat';
import { detectChordFromNotes } from './tonal/chordDetection';

function mockSequencer(notes: Note[]): Sequencer {
  return {
    matrix: {
      notes,
    },
  } as unknown as Sequencer;
}

describe('detectChordFromNotes + getPitchClassesAtBeat integration', () => {
  it('detects a C major triad from multiple sequencers at beat 0', () => {
    const seq1 = mockSequencer([{ pitch: 'C4', start: 0, duration: 2 }]);
    const seq2 = mockSequencer([{ pitch: 'E4', start: 0, duration: 2 }]);
    const seq3 = mockSequencer([{ pitch: 'G4', start: 0, duration: 2 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3], 0);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 0, duration: 1 }))
    );

    expect(chord?.symbol).toBe('CM');
    expect(chord?.quality).toBe('Major');
  });

  it('detects an F minor chord across tracks at beat 2', () => {
    const seq1 = mockSequencer([{ pitch: 'F3', start: 2, duration: 1 }]);
    const seq2 = mockSequencer([{ pitch: 'Ab3', start: 2, duration: 1 }]);
    const seq3 = mockSequencer([{ pitch: 'C4', start: 2, duration: 1 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3], 2);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 2, duration: 1 }))
    );

    expect(chord?.symbol).toBe('Fm');
    expect(chord?.quality).toBe('Minor');
  });

  it('returns null when no recognizable chord exists at beat 1', () => {
    const seq1 = mockSequencer([{ pitch: 'C#4', start: 1, duration: 1 }]);
    const seq2 = mockSequencer([{ pitch: 'D4', start: 1, duration: 1 }]);
    const seq3 = mockSequencer([{ pitch: 'F#4', start: 1, duration: 1 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3], 1);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 1, duration: 1 }))
    );

    expect(chord).toBeNull();
  });

  it('detects a G7 chord with missing fifth', () => {
    const seq1 = mockSequencer([{ pitch: 'G3', start: 0, duration: 2 }]);
    const seq2 = mockSequencer([{ pitch: 'B3', start: 0, duration: 2 }]);
    const seq3 = mockSequencer([{ pitch: 'F4', start: 0, duration: 2 }]); // no D

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3], 0);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 0, duration: 1 }))
    );

    expect(chord?.symbol).toBe('G7');
  });
});

describe('detectChordFromNotes integration - edge cases', () => {
  it('handles duplicated notes across tracks', () => {
    const seq1 = mockSequencer([{ pitch: 'C4', start: 0, duration: 2 }]);
    const seq2 = mockSequencer([{ pitch: 'C5', start: 0, duration: 2 }]);
    const seq3 = mockSequencer([{ pitch: 'E4', start: 0, duration: 2 }, { pitch: 'G4', start: 0, duration: 2 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3], 0);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 0, duration: 1 }))
    );

    expect(chord?.symbol).toBe('CM'); // Duplicates of C should not affect this
  });

  it('detects minor 7th chord even with loose voicing', () => {
    const seq1 = mockSequencer([{ pitch: 'A2', start: 2, duration: 1 }]);
    const seq2 = mockSequencer([{ pitch: 'C3', start: 2, duration: 1 }]);
    const seq3 = mockSequencer([{ pitch: 'E3', start: 2, duration: 1 }]);
    const seq4 = mockSequencer([{ pitch: 'G3', start: 2, duration: 1 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3, seq4], 2);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 2, duration: 1 }))
    );

    expect(chord?.symbol).toBe('Am7');
  });

  it('ignores high-register ornamentation (clustered color tones)', () => {
    const seq1 = mockSequencer([{ pitch: 'C4', start: 1, duration: 2 }]);
    const seq2 = mockSequencer([{ pitch: 'E4', start: 1, duration: 2 }]);
    const seq3 = mockSequencer([{ pitch: 'G4', start: 1, duration: 2 }]);
    const seq4 = mockSequencer([{ pitch: 'D6', start: 1, duration: 0.25 }]); // fleeting ornament

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2, seq3, seq4], 1, 1, 0.1);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 1, duration: 1 }))
    );

    expect(chord?.symbol).toBe('CM'); // D6 shouldn't affect chord match
  });

  it('returns null for interval-only dyads', () => {
    const seq1 = mockSequencer([{ pitch: 'C4', start: 0, duration: 2 }]);
    const seq2 = mockSequencer([{ pitch: 'E4', start: 0, duration: 2 }]);

    const pitchClasses = getPitchClassesAtBeat([seq1, seq2], 0);
    const chord = detectChordFromNotes(
      Array.from(pitchClasses).map(pc => ({ pitch: pc, start: 0, duration: 1 }))
    );

    expect(chord).toBeNull(); // Two notes (C, E) ≠ a chord
  });
});
