// src/components/sequencer/utils/snappedBeat.test.ts

// npm run test -- src/components/sequencer/utils/snappedBeat.test.ts

import { describe, it, expect } from 'vitest';
import { getSnappedBeat } from './snappedBeat';

describe('getSnappedBeat', () => {
  it('snaps to nearest base resolution when not in triplet mode', () => {
    const config = { snapResolution: 0.25, isTripletMode: false };

    expect(getSnappedBeat(0.1, config)).toBe(0.0);
    expect(getSnappedBeat(0.2, config)).toBe(0.25);
    expect(getSnappedBeat(1.12, config)).toBe(1.0);
    expect(getSnappedBeat(2.38, config)).toBe(2.5);
  });

  it('snaps to nearest triplet resolution when in triplet mode', () => {
    const config = { snapResolution: 0.25, isTripletMode: true };

    expect(getSnappedBeat(0.1, config)).toBeCloseTo(0.1667, 3);
    expect(getSnappedBeat(0.25, config)).toBeCloseTo(0.3333, 3);
    expect(getSnappedBeat(0.34, config)).toBeCloseTo(0.3333, 3);
    expect(getSnappedBeat(1.0, config)).toBeCloseTo(1.0, 3);
  });

  it('handles zero snap resolution gracefully', () => {
    const config = { snapResolution: 0, isTripletMode: false };

    // fall back to 0.25 base step
    expect(getSnappedBeat(0.1, config)).toBe(0.0);
    expect(getSnappedBeat(0.2, config)).toBe(0.25);
  });

  it('handles large values correctly', () => {
    const config = { snapResolution: 1, isTripletMode: false };

    expect(getSnappedBeat(9.6, config)).toBe(10);
    expect(getSnappedBeat(2.3, config)).toBe(2);
  });

  it('triplet mode still works with custom resolution', () => {
    const config = { snapResolution: 0.5, isTripletMode: true };

    // triplet snapStep = 0.3333...
    expect(getSnappedBeat(0.3, config)).toBeCloseTo(0.3333, 3);
    expect(getSnappedBeat(0.7, config)).toBeCloseTo(0.6667, 3);
    expect(getSnappedBeat(1.5, config)).toBeCloseTo(1.6667, 3);
  });
});
