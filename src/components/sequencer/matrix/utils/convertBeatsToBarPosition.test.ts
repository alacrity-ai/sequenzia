// src/components/sequencer/matrix/utils/convertBeatsToBarPosition.test.ts

// npm run test -- src/components/sequencer/matrix/utils/convertBeatsToBarPosition.test.ts

import { describe, it, expect } from 'vitest';
import { convertBeatToBarPosition } from '@/components/sequencer/matrix/utils/convertBeatsToBarPosition';

describe('convertBeatToBarPosition', () => {
  it('should compute correct bar and position for whole beat', () => {
    const result = convertBeatToBarPosition(5, 4, 4);
    // bar = floor(5/4) = 1, position = (5 % 4) * 4 = 1 * 4 = 4
    expect(result).toEqual({ bar: 1, position: 4 });
  });

  it('should compute correct position for fractional beat within bar', () => {
    const result = convertBeatToBarPosition(2.5, 4, 4);
    // bar = 0, position = (2.5 % 4) * 4 = 2.5 * 4 = 10 → rounded to 10
    expect(result).toEqual({ bar: 0, position: 10 });
  });

  it('should handle exact bar boundary correctly', () => {
    const result = convertBeatToBarPosition(8, 4, 4);
    // bar = floor(8/4) = 2, position = (8 % 4) * 4 = 0
    expect(result).toEqual({ bar: 2, position: 0 });
  });

  it('should handle small fractional beats near zero', () => {
    const result = convertBeatToBarPosition(0.125, 4, 4);
    // bar = 0, position = 0.125 * 4 = 0.5 → rounds to 1
    expect(result).toEqual({ bar: 0, position: 1 });
  });

  it('should handle large beat values correctly', () => {
    const result = convertBeatToBarPosition(123.75, 4, 4);
    // bar = floor(123.75 / 4) = 30
    // position = (123.75 % 4) * 4 = 3.75 * 4 = 15
    expect(result).toEqual({ bar: 30, position: 15 });
  });

  it('should handle zero beat correctly', () => {
    const result = convertBeatToBarPosition(0, 4, 4);
    expect(result).toEqual({ bar: 0, position: 0 });
  });
});
