// src/shared/llm/tasks/remi/normalizeRemiPositions.test.ts

// npm run test -- src/shared/llm/tasks/remi/normalizeRemiPositions.test.ts

import { describe, it, expect } from 'vitest';
import { normalizeRemiPositions } from '@/shared/llm/tasks/remi/helpers/normalizeRemiPositions';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

describe('normalizeRemiPositions', () => {
  const beatsPerBar = 4;
  const stepsPerBeat = 4; // => maxPositionPerBar = 16

  it('should pass through events with no overflow', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 }
    ];

    const result = normalizeRemiPositions(input, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(input);
  });

  it('should normalize overflowing positions into new bars', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 20 },  // Should roll into Bar 1, Position 4
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];

    const result = normalizeRemiPositions(input, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(expected);
  });

  it('should emit Bar only when bar changes', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 10 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Position', value: 25 },  // Rolls into Bar 3, Position 9
      { type: 'Pitch', value: 'A4' },
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 10 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 9 },
      { type: 'Pitch', value: 'A4' },
    ];

    const result = normalizeRemiPositions(input, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(expected);
  });

  it('should handle multiple overflows across bars', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 15 },  // Bar 0, Position 15 (ok)
      { type: 'Position', value: 16 },  // Rolls to Bar 1, Position 0
      { type: 'Position', value: 33 }   // Rolls to Bar 2, Position 1
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 15 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 1 }
    ];

    const result = normalizeRemiPositions(input, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(expected);
  });

  it('should not duplicate Bar events unnecessarily', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Position', value: 5 },  // Still Bar 0, but requires Bar emission since last emitted was Pitch
      { type: 'Pitch', value: 'D4' },
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Bar', value: 0 },  // Correctly re-emitted
      { type: 'Position', value: 5 },
      { type: 'Pitch', value: 'D4' },
    ];

    const result = normalizeRemiPositions(input, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(expected);
  });
});
