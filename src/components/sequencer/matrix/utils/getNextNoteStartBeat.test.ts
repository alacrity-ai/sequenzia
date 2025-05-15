// src/components/sequencer/matrix/utils/getNextNoteStartBeat.test.ts

// npm run test -- src/components/sequencer/matrix/utils/getNextNoteStartBeat.test.ts

import { describe, it, expect } from 'vitest';
import { getNextNoteStartBeat } from './getNextNoteStartBeat';

const mockSequencer = (notes: { start: number; duration: number }[]) =>
  ({ notes } as any);

describe('getNextNoteStartBeat', () => {
  it('should return the next note after fromBeat', () => {
    const sequencer = mockSequencer([
      { start: 4, duration: 1 },
      { start: 8, duration: 1 },
      { start: 12, duration: 1 }
    ]);

    const result = getNextNoteStartBeat(sequencer, 5);
    expect(result).toBe(8);
  });

  it('should return null if no notes after fromBeat', () => {
    const sequencer = mockSequencer([
      { start: 2, duration: 1 },
      { start: 3, duration: 1 }
    ]);

    const result = getNextNoteStartBeat(sequencer, 5);
    expect(result).toBeNull();
  });

  it('should return null for empty sequencer', () => {
    const sequencer = mockSequencer([]);
    const result = getNextNoteStartBeat(sequencer, 0);
    expect(result).toBeNull();
  });

  it('should correctly return note starting exactly at fromBeat', () => {
    const sequencer = mockSequencer([
      { start: 4, duration: 1 },
      { start: 8, duration: 1 }
    ]);

    const result = getNextNoteStartBeat(sequencer, 4);
    expect(result).toBe(4);
  });

  it('should pick the earliest note after fromBeat even if unsorted', () => {
    const sequencer = mockSequencer([
      { start: 10, duration: 1 },
      { start: 6, duration: 1 },
      { start: 8, duration: 1 }
    ]);

    const result = getNextNoteStartBeat(sequencer, 5);
    expect(result).toBe(6);
  });

  it('should handle negative fromBeat correctly', () => {
    const sequencer = mockSequencer([
      { start: 2, duration: 1 },
      { start: 5, duration: 1 }
    ]);

    const result = getNextNoteStartBeat(sequencer, -3);
    expect(result).toBe(2);
  });
});
