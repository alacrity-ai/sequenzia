// src/shared/llm/tasks/remi/helpers/shiftLLMContinuationToEndBeat.test.ts

// npm run test -- src/shared/llm/tasks/remi/helpers/shiftLLMContinuationToEndBeat.test.ts

import { describe, it, expect } from 'vitest';
import { shiftLLMContinuationToEndBeat } from './shiftLLMContinuationToEndBeat';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

describe('shiftLLMContinuationToEndBeat', () => {
  const beatsPerBar = 4;
  const stepsPerBeat = 4;

  it('should shift Bar 2 Position 0 to endBeat 0', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 },
    ];

    const result = shiftLLMContinuationToEndBeat(input, 0, beatsPerBar, stepsPerBeat);

    expect(result).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 },
    ]);
  });

  it('should shift Bar 5 Position 0 to endBeat 8', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 2 },
      { type: 'Velocity', value: 90 },
    ];

    const result = shiftLLMContinuationToEndBeat(input, 8, beatsPerBar, stepsPerBeat);

    expect(result).toEqual([
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 2 },
      { type: 'Velocity', value: 90 },
    ]);
  });

  it('should shift Bar 1 Position 8 to endBeat 4.5', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 8 }, // absolute beat 1*4 + 8/4 = 6
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 100 },
    ];

    const result = shiftLLMContinuationToEndBeat(input, 4.5, beatsPerBar, stepsPerBeat);

    // shifting delta = 4.5 - 6 = -1.5 beats
    // shifted absolute beat = 6 - 1.5 = 4.5
    // newBar = floor(4.5 / 4) = 1
    // newPosition = (4.5 % 4) * stepsPerBeat = 0.5 * 4 = 2
    expect(result).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 2 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 1 },
      { type: 'Velocity', value: 100 },
    ]);
  });

  it('should leave events untouched if no Position exists', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 3 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 2 },
      { type: 'Velocity', value: 70 },
    ];

    const result = shiftLLMContinuationToEndBeat(input, 4, beatsPerBar, stepsPerBeat);

    expect(result).toEqual(input); // nothing to shift
  });
});
