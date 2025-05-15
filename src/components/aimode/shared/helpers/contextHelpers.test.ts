// src/components/aimode/shared/helpers/contextHelpers.test.ts

// npm run test -- src/components/aimode/shared/helpers/contextHelpers.test.ts

import { describe, it, expect, vi } from 'vitest';
import {
  getStartBeatAndEndBeat,
  getClipBoundaryFromEndBeat,
  getAutoCompleteStartBar
} from './contextHelpers';

// Mocks
vi.mock('@/components/aimode/shared/stores/llmSettingsStore', () => ({
  getLLMSettings: () => ({
    context: { contextBeats: 8 }
  })
}));

vi.mock('@/components/aimode/shared/settings/getRemiSettings', () => ({
  getRemiSettings: () => ({ beatsPerBar: 4, stepsPerBeat: 4 })
}));

describe('contextHelpers', () => {
  describe('getStartBeatAndEndBeat', () => {
    const mockSequencer = (notes: any[]) => ({ notes } as any);

    it('should return [0, contextLengthBeats] for empty sequencer', () => {
      const result = getStartBeatAndEndBeat(mockSequencer([]));
      expect(result).toEqual([0, 8]);
    });

    it('should compute start and end beats correctly', () => {
      const notes = [
        { start: 4, duration: 1 },
        { start: 7, duration: 2 } // ends at 9
      ];
      const result = getStartBeatAndEndBeat(mockSequencer(notes));

      // End beat rounds up to 9, startBeat = endBeat - contextBeats (clamped to 0)
      expect(result).toEqual([1, 9]);
    });

    it('should clamp startBeat to 0 if endBeat < context window', () => {
      const notes = [{ start: 1, duration: 1 }]; // ends at 2
      const result = getStartBeatAndEndBeat(mockSequencer(notes));
      expect(result).toEqual([0, 2]);
    });
  });

  describe('getClipBoundaryFromEndBeat', () => {
    it('should compute clipAfterBar and clipAfterPosition correctly', () => {
      const result = getClipBoundaryFromEndBeat(10, 4, 4);
      expect(result).toEqual({ clipAfterBar: 2, clipAfterPosition: 2 * 4 });
    });

    it('should handle fractional endBeat and rounding', () => {
      const result = getClipBoundaryFromEndBeat(5.25, 4, 4);
      // clipAfterBar = 1, clipAfterPosition = 5.25 % 4 = 1.25 * 4 = 5
      expect(result).toEqual({ clipAfterBar: 1, clipAfterPosition: 5 });
    });
  });

  describe('getAutoCompleteStartBar', () => {
    const mockSequencer = (notes: any[]) => ({ notes } as any);

    it('should compute start bar correctly', () => {
      const notes = [{ start: 5, duration: 1 }]; // ends at 6
      const result = getAutoCompleteStartBar(mockSequencer(notes));

      // endBeat = 6 -> startBar = floor(6 / 4) = 1
      expect(result).toBe(1);
    });
  });
  
  describe('getClipBoundaryFromEndBeat', () => {
    it('should compute clipAfterBar and clipAfterPosition correctly', () => {
      const result = getClipBoundaryFromEndBeat(10, 4, 4);
      expect(result).toEqual({ clipAfterBar: 2, clipAfterPosition: 2 * 4 });
    });

    it('should handle fractional endBeat and rounding', () => {
      const result = getClipBoundaryFromEndBeat(5.25, 4, 4);
      // clipAfterBar = 1, clipAfterPosition = 1.25 * 4 = 5
      expect(result).toEqual({ clipAfterBar: 1, clipAfterPosition: 5 });
    });

    it('should handle exact bar boundary without position overflow', () => {
      const result = getClipBoundaryFromEndBeat(8, 4, 4);
      // clipAfterBar = 2, clipAfterPosition = 0
      expect(result).toEqual({ clipAfterBar: 2, clipAfterPosition: 0 });
    });

    it('should handle small fractional beats near zero', () => {
      const result = getClipBoundaryFromEndBeat(0.125, 4, 4);
      // clipAfterBar = 0, clipAfterPosition = 0.125 * 4 = 0.5 → rounds to 1
      expect(result).toEqual({ clipAfterBar: 0, clipAfterPosition: 1 });
    });

    it('should handle large beat values correctly', () => {
      const result = getClipBoundaryFromEndBeat(123.75, 4, 4);
      // clipAfterBar = 30, clipAfterPosition = 3.75 % 4 = 3.75 * 4 = 15
      expect(result).toEqual({ clipAfterBar: 30, clipAfterPosition: 15 });
    });
  });

});
