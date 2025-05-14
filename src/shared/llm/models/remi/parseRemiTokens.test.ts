// src/shared/llm/models/remi/parseRemiTokens.test.ts

// npm run test -- src/shared/llm/models/remi/parseRemiTokens.test.ts

import { describe, it, expect, vi } from 'vitest';
import { parseRemiTokens } from './parseRemiTokens';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

function expectWarningContaining(substring: string) {
  const warnCalls = (console.warn as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat();
  expect(warnCalls.some((msg: unknown) => typeof msg === 'string' && msg.includes(substring))).toBe(true);
}

describe('parseRemiTokens', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});

  it('should parse well-formed REMI tokens', () => {
    const input = [
      'Bar 1',
      'Position 0',
      'Pitch C4',
      'Duration 4',
      'Velocity 90'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should handle underscore-compound tokens (e.g., Bar_2_Position_0)', () => {
    const input = [
      'Bar_2_Position_0_Pitch_D4_Duration_4_Velocity_80'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 80 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should handle space-compound tokens (e.g., Bar 2 Position 0 Pitch C4)', () => {
    const input = [
      'Bar 2 Position 0 Pitch C4 Duration 4 Velocity 100'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should merge stray type/value tokens pairwise (e.g., ["Bar", "3", "Position", "12"])', () => {
    const input = [
      'Bar', '3', 'Position', '12', 'Pitch', 'E4', 'Duration', '2', 'Velocity', '85'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 12 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 2 },
      { type: 'Velocity', value: 85 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should skip invalid tokens and warn', () => {
    const input = [
      'Bar', 'X',  // invalid value
      'Position', 'Y', // invalid value
      'Pitch', 'A4',
      'Duration', 'abc', // invalid value
      'Velocity', '90'
    ];

    const expected: RemiEvent[] = [
      { type: 'Pitch', value: 'A4' },
      { type: 'Velocity', value: 90 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid numeric value in REMI token'));
  });

  it('should tolerate garbage input and fallback', () => {
    const input = [
      'Bar', 'X',  // invalid number
      'Position', 'Y',  // invalid number
      'Pitch', 'A4',  // valid
      'Duration', 'abc',  // invalid number
      'Velocity', '90',  // valid
      'This', 'Is',
      'Garbage', 'Data'
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual([
      { type: 'Pitch', value: 'A4' },
      { type: 'Velocity', value: 90 }
    ]);

    // Validate warning patterns occurred
    expectWarningContaining('Invalid numeric value');
    expectWarningContaining('Unknown REMI token type');
  });
});
