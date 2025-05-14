/// <reference types="vitest" />

// src/shared/llm/tasks/remi/adapters/RemiOutputAdapter.test.ts

// npm run test -- src/shared/llm/tasks/remi/adapters/RemiOutputAdapter.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemiOutputAdapter } from './remiOutputAdapter';
import { parseRemiTokens } from '@/shared/llm/tasks/remi/parsers/parseRemiTokens';

import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { Mock } from 'vitest';

// === Mock parseRemiTokens ===
vi.mock('@/shared/llm/tasks/remi/parsers/parseRemiTokens', () => ({
  parseRemiTokens: vi.fn()
}));

describe('RemiOutputAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the array as-is if rawResult is RemiEvent[]', () => {
    const input: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Pitch', value: 'C3' }
    ];

    const result = RemiOutputAdapter.parse(input);

    expect(result).toEqual(input);
  });

  it('should parse string input via parseRemiTokens', () => {
    const mockParsed: RemiEvent[] = [
      { type: 'Position', value: 4 },
      { type: 'Duration', value: 2 }
    ];

    (parseRemiTokens as Mock).mockReturnValueOnce(mockParsed);

    const result = RemiOutputAdapter.parse('Position 4 Duration 2');

    expect(parseRemiTokens).toHaveBeenCalledWith('Position 4 Duration 2');
    expect(result).toEqual(mockParsed);
  });

  it('should throw if rawResult is null', () => {
    expect(() => RemiOutputAdapter.parse(null)).toThrow('REMI parse failed: result is null or undefined.');
  });

  it('should throw if rawResult is undefined', () => {
    expect(() => RemiOutputAdapter.parse(undefined)).toThrow('REMI parse failed: result is null or undefined.');
  });

  it('should throw if rawResult is an unsupported type', () => {
    expect(() => RemiOutputAdapter.parse(12345)).toThrow('Unsupported REMI result type: number');
    expect(() => RemiOutputAdapter.parse({ some: 'object' })).toThrow('Unsupported REMI result type: object');
  });
});
