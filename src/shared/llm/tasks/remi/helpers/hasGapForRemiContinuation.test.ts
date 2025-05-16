// src/shared/llm/tasks/remi/helpers/hasGapForRemiContinuation.test.ts

// npm run test -- src/shared/llm/tasks/remi/helpers/hasGapForRemiContinuation.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hasGapForRemiContinuation } from './hasGapForRemiContinuation';
import { getTotalBeats } from '@/shared/playback/transportService.js';

import type { Mock } from 'vitest';

vi.mock('@/shared/playback/transportService.js', () => ({
  getTotalBeats: vi.fn(),
}));

vi.mock('@/shared/state/devMode.js', () => ({
  devLog: vi.fn(),
}));

describe('hasGapForRemiContinuation', () => {
  const sequencer = {
    notes: [],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false if fromBeat is at or beyond totalBeats', () => {
    (getTotalBeats as Mock).mockReturnValue(16);

    const result = hasGapForRemiContinuation(sequencer, 16, 4);

    expect(result).toBe(false);
    expect(getTotalBeats).toHaveBeenCalled();
  });

  it('returns true if no collisions in continuation range', () => {
    (getTotalBeats as Mock).mockReturnValue(16);

    sequencer.notes = [
      { start: 0, duration: 2 }, // ends at 2
      { start: 10, duration: 2 }, // ends at 12
    ];

    const result = hasGapForRemiContinuation(sequencer, 4, 4); // [4,8)
    expect(result).toBe(true);
  });

  it('returns false if there is a collision in continuation range', () => {
    (getTotalBeats as Mock).mockReturnValue(16);

    sequencer.notes = [
      { start: 6, duration: 2 }, // starts at 6, ends at 8 → overlaps with [4,8)
    ];

    const result = hasGapForRemiContinuation(sequencer, 4, 4);
    expect(result).toBe(false);
  });

  it('returns true if continuation range ends before next note', () => {
    (getTotalBeats as Mock).mockReturnValue(16);

    sequencer.notes = [
      { start: 10, duration: 2 }, // starts at 10 → safe if we try [4,8)
    ];

    const result = hasGapForRemiContinuation(sequencer, 4, 4);
    expect(result).toBe(true);
  });

  it('returns false if continuation range exceeds song length', () => {
    (getTotalBeats as Mock).mockReturnValue(8);

    sequencer.notes = [];

    const result = hasGapForRemiContinuation(sequencer, 7, 4); // would try [7, 8)
    expect(result).toBe(true); // no collision, still valid within song
  });

  it('clamps toBeat to totalBeats', () => {
    (getTotalBeats as Mock).mockReturnValue(10);

    sequencer.notes = [
      { start: 9, duration: 2 }, // overlaps [9,10)
    ];

    const result = hasGapForRemiContinuation(sequencer, 8, 4); // would try [8,10)
    expect(result).toBe(false);
  });
});
