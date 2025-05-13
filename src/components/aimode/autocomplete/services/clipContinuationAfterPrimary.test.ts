// src/components/aimode/autocomplete/services/clipContinuationAfterPrimary.test.ts

// npm run test -- src/components/aimode/autocomplete/services/clipContinuationAfterPrimary.test.ts

import { describe, it, expect } from 'vitest';
import { clipContinuationAfterPrimary } from './contextExtractionService';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

describe('clipContinuationAfterPrimary (using clipAfterBar & clipAfterPosition)', () => {
  it('should clip continuation positions before (clipAfterBar, clipAfterPosition)', () => {
    const llmContinuationRemi: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 80 },

      { type: 'Position', value: 3 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 85 },

      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 90 },

      { type: 'Position', value: 1 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 95 },

      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 100 }
    ];

    const expectedClippedContinuation: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 100 }
    ];

    // Clip after (Bar 2, Position 1)
    const result = clipContinuationAfterPrimary(llmContinuationRemi, 2, 1);

    expect(result).toEqual(expectedClippedContinuation);
  });

  it('should keep only positions in higher Bars after clipAfterBar', () => {
    const llmContinuationRemi: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 3 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 85 },

      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 90 }
    ];

    const expectedClippedContinuation: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 90 }
    ];

    // Clip after (Bar 1, Position 3)
    const result = clipContinuationAfterPrimary(llmContinuationRemi, 1, 3);

    expect(result).toEqual(expectedClippedContinuation);
  });

  it('should return empty if no positions are after clipAfterBar/Position', () => {
    const llmContinuationRemi: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 80 }
    ];

    // Clip after (Bar 2, Position 0)
    const result = clipContinuationAfterPrimary(llmContinuationRemi, 2, 0);

    expect(result).toEqual([]);
  });

  it('should keep all continuation events if all are after clip point', () => {
    const llmContinuationRemi: RemiEvent[] = [
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 90 }
    ];

    const expected = [...llmContinuationRemi];

    // Clip after (Bar 2, Position 4)
    const result = clipContinuationAfterPrimary(llmContinuationRemi, 2, 4);

    expect(result).toEqual(expected);
  });

  it('should correctly clip when LLM omits Bar tokens but positions are valid', () => {
    const llmContinuationRemi: RemiEvent[] = [
      { type: 'Position', value: 3 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 90 },

      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 95 }
    ];

    const expectedClippedContinuation: RemiEvent[] = [
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 95 }
    ];

    // In absence of Bar events, treat Position values as relative to current Bar 0.
    const result = clipContinuationAfterPrimary(llmContinuationRemi, 0, 3);

    expect(result).toEqual(expectedClippedContinuation);
  });
});
