// src/shared/utils/musical/getPitchClassesAtBeat.test.ts

// npm run test -- src/shared/utils/musical/getPitchClassesAtBeat.test.ts


import { describe, it, expect } from 'vitest';
import { getPitchClassesAtBeat } from './getPitchClassesAtBeat';
import type { Note } from '@/shared/interfaces/Note';
import type Sequencer from '@/sequencer/sequencer.js';

// Helper to mock a Sequencer with a given note array
function mockSequencer(notes: Note[]): Sequencer {
  return {
    matrix: {
      notes,
    },
  } as unknown as Sequencer;
}

describe('getPitchClassesAtBeat', () => {
  it('returns pitch classes for a single sequencer with simple overlap', () => {
    const seq = mockSequencer([
      { pitch: 'C4', start: 0, duration: 1 },
      { pitch: 'E4', start: 0, duration: 1 },
      { pitch: 'G4', start: 0, duration: 1 },
    ]);
    const result = getPitchClassesAtBeat([seq], 0);
    expect(Array.from(result).sort()).toEqual(['C', 'E', 'G']);
  });

  it('returns pitch classes for multiple sequencers', () => {
    const seq1 = mockSequencer([
      { pitch: 'C3', start: 0, duration: 2 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'F3', start: 1, duration: 2 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1);
    expect(Array.from(result).sort()).toEqual(['C', 'F']);
  });

  it('ignores notes outside the window', () => {
    const seq = mockSequencer([
      { pitch: 'D4', start: 0, duration: 1 },
      { pitch: 'F4', start: 2, duration: 1 },
    ]);
    const result = getPitchClassesAtBeat([seq], 1);
    expect(result.size).toBe(0);
  });

  it('includes notes overlapping the beat with driftTolerance', () => {
    const seq = mockSequencer([
      { pitch: 'A4', start: 0.75, duration: 0.5 },
    ]);
    const result = getPitchClassesAtBeat([seq], 1, 1, 0.25);
    expect(result.has('A')).toBe(true);
  });

  it('deduplicates pitch classes', () => {
    const seq = mockSequencer([
      { pitch: 'C4', start: 0, duration: 2 },
      { pitch: 'C5', start: 1, duration: 1 },
    ]);
    const result = getPitchClassesAtBeat([seq], 1);
    expect(Array.from(result)).toEqual(['C']);
  });

  it('handles missing matrix on sequencer gracefully', () => {
    const seq = { matrix: null } as unknown as Sequencer;
    const result = getPitchClassesAtBeat([seq], 0);
    expect(result.size).toBe(0);
  });
});

describe('getPitchClassesAtBeat - multi-sequencer integration', () => {
  it('combines notes from two sequencers at the same beat', () => {
    const seq1 = mockSequencer([
      { pitch: 'C4', start: 1, duration: 1 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'E4', start: 1, duration: 1 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1);
    expect(Array.from(result).sort()).toEqual(['C', 'E']);
  });

  it('includes overlapping notes from different sequencers with drift', () => {
    const seq1 = mockSequencer([
      { pitch: 'D4', start: 0.75, duration: 1 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'F4', start: 1.1, duration: 0.5 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1, 1, 0.25);
    expect(Array.from(result).sort()).toEqual(['D', 'F']);
  });

  it('resolves polyphony across sequencers and deduplicates pitch classes', () => {
    const seq1 = mockSequencer([
      { pitch: 'G3', start: 1, duration: 2 },
      { pitch: 'C4', start: 1, duration: 1 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'C5', start: 1, duration: 1 },
      { pitch: 'E4', start: 1, duration: 1 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1);
    expect(Array.from(result).sort()).toEqual(['C', 'E', 'G']);
  });

  it('returns empty when no sequencer contributes notes in the window', () => {
    const seq1 = mockSequencer([
      { pitch: 'D4', start: 0, duration: 0.5 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'F4', start: 2, duration: 0.25 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1);
    expect(result.size).toBe(0);
  });

  it('handles tightly overlapping rhythms between sequencers', () => {
    const seq1 = mockSequencer([
      { pitch: 'A3', start: 0.9, duration: 0.2 },
    ]);
    const seq2 = mockSequencer([
      { pitch: 'B3', start: 1.05, duration: 0.2 },
    ]);
    const result = getPitchClassesAtBeat([seq1, seq2], 1, 1, 0.1);
    expect(Array.from(result).sort()).toEqual(['A', 'B']);
  });
});

