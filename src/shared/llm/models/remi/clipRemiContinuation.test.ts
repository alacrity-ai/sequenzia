// src/shared/llm/models/remi/clipRemiContinuation.test.ts

// npm run test -- src/shared/llm/models/remi/clipRemiContinuation.test.ts

import { describe, it, expect } from 'vitest';
import { clipRemiContinuation } from './clipRemiContinuation';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

describe('clipRemiContinuation', () => {
  it('should clip all events before clip point (bar difference)', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];

    const result = clipRemiContinuation(input, 1, 0);

    expect(result).toEqual([
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ]);
  });

  it('should clip positions before clip point in same bar', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 85 }
    ];

    const result = clipRemiContinuation(input, 1, 4);

    expect(result).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 85 }
    ]);
  });

  it('should return empty array if all events are before clip point', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 }
    ];

    const result = clipRemiContinuation(input, 1, 0);

    expect(result).toEqual([]);
  });

  it('should include positions exactly at clipAfterPosition', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 }
    ];

    const result = clipRemiContinuation(input, 1, 4);

    expect(result).toEqual(input); // Should include exact match
  });

  it('should handle multiple Bars with mixed clipping', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 85 },
      { type: 'Position', value: 6 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 95 }
    ];

    const result = clipRemiContinuation(input, 1, 4);

    expect(result).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 6 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 95 }
    ]);
  });
});
