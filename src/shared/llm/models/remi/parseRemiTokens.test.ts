// src/shared/llm/models/remi/parseRemiTokens.test.ts

// npm run test -- src/shared/llm/models/remi/parseRemiTokens.test.ts

import { describe, it, expect, vi } from 'vitest';
import { parseRemiTokens } from './parseRemiTokens';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

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

  it('should parse uppercase REMI tokens correctly', () => {
    const input = [
      'BAR 1',
      'POSITION 4',
      'PITCH F#3',
      'DURATION 8',
      'VELOCITY 100'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'F#3' },
      { type: 'Duration', value: 8 },
      { type: 'Velocity', value: 100 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse alias abbreviations (Pos, Vel, Dur)', () => {
    const input = [
      'Bar 2',
      'Pos 0',
      'Pitch C3',
      'Dur 4',
      'Vel 90'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C3' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should handle mixed casing and quirks robustly', () => {
    const input = [
      'bar 5 Pos 8 Pitch G2 Dur 16 Vel 70'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'G2' },
      { type: 'Duration', value: 16 },
      { type: 'Velocity', value: 70 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse colon-separated REMI tokens and skip unknown types', () => {
    const input = [
      'Tonality:Cmajor',
      'Meter:4/4',
      'Bar:2',
      'Position:16',
      'Note:C4',
      'Duration:4',
      'Bar:3',
      'Position:0',
      'Note:D4',
      'Duration:4',
      'Bar:3',
      'Position:4',
      'Note:E4',
      'Duration:4',
      'Bar:3',
      'Position:8',
      'Note:D4',
      'Duration:4',
      'Bar:3',
      'Position:12',
      'Note:C4',
      'Duration:4'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 16 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 3 },
      { type: 'Position', value: 12 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse colon pitches and standalone durations (LLM quirky response)', () => {
    const input = [
      '4/4',     // should be ignored
      'C:5',     // → Pitch C5
      'D:4',     // → Pitch D4
      '8',       // → Duration 8
      'E:4',     // → Pitch E4
      '8',       // → Duration 8
      'F:4',     // → Pitch F4
      '8',       // → Duration 8
      'G:4',     // → Pitch G4
      '8',       // → Duration 8
      'C:6',     // → Pitch C6
      '4',       // → Duration 4
      'A:4',     // → Pitch A4
      '4',       // → Duration 4
      'C:6',     // → Pitch C6
      '4',       // → Duration 4
      'G:4',     // → Pitch G4
      '4'        // → Duration 4
    ];

    const expected: RemiEvent[] = [
      { type: 'Pitch', value: 'C5' },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 8 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 8 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 8 },
      { type: 'Pitch', value: 'C6' },
      { type: 'Duration', value: 4 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 4 },
      { type: 'Pitch', value: 'C6' },
      { type: 'Duration', value: 4 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse =-separated tokens with \\n noise (LLM quirk)', () => {
    const input = [
      '_\n',                   // junk, ignored
      'TRACK=PRIMARY\n',        // ignored (unknown type)
      'BAR=1\n',                // Bar 1
      'POS=16\n',               // Position 16
      'PITCH=E7\n',             // Pitch E7
      'DUR=4\n',                // Duration 4
      'POS=20\n',               // Position 20
      'PITCH=B6\n',             // Pitch B6
      'DUR=4\n',                // Duration 4
      'POS=24\n',               // Position 24
      'PITCH=C7\n',             // Pitch C7
      'DUR=4\n',                // Duration 4
      'POS=28\n',               // Position 28
      'PITCH=A6\n',             // Pitch A6
      'DUR=4\n',                // Duration 4
      'BAR=2\n',                // Bar 2
      'POS=0\n'                 // Position 0
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 16 },
      { type: 'Pitch', value: 'E7' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 20 },
      { type: 'Pitch', value: 'B6' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 24 },
      { type: 'Pitch', value: 'C7' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 28 },
      { type: 'Pitch', value: 'A6' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse CSV-prefixed tokens with trailing REMI comments', () => {
    const input = [
      '0.0,96,4 // Position 0, Pitch B6, Duration 4',
      '0.4,96,4 // Position 4, Pitch C7, Duration 4',
      '0.8,98,4 // Position 8, Pitch D7, Duration 4',
      '0.12,96,4 // Position 12, Pitch C7, Duration 4'
    ];

    const expected: RemiEvent[] = [
      { type: 'Position', value: 0 },
      { type: 'Velocity', value: 96 },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'B6' },
      { type: 'Duration', value: 4 },

      { type: 'Position', value: 6 },
      { type: 'Velocity', value: 96 },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'C7' },
      { type: 'Duration', value: 4 },

      { type: 'Position', value: 13 },
      { type: 'Velocity', value: 98 },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D7' },
      { type: 'Duration', value: 4 },

      { type: 'Position', value: 2 },
      { type: 'Velocity', value: 96 },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 12 },
      { type: 'Pitch', value: 'C7' },
      { type: 'Duration', value: 4 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse CSV-only structured tokens as Position, Velocity, Duration', () => {
    const input = [
      '0.0,100,8',
      '0.8,98,8'
    ];

    const expected: RemiEvent[] = [
      { type: 'Position', value: 0 },
      { type: 'Velocity', value: 100 },
      { type: 'Duration', value: 8 },

      { type: 'Position', value: 13 },
      { type: 'Velocity', value: 98 },
      { type: 'Duration', value: 8 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse pipe-separated tokens into RemiEvents', () => {
    const input = [
      'TRACK_INFO|PRIMARY',
      'INST|MELODY',
      'BAR|1',
      'POS|16|PITCH|G7|DUR|4',
      'POS|20|PITCH|A7|DUR|4',
      'POS|24|PITCH|B7|DUR|4',
      'POS|28|PITCH|C8|DUR|4',
      'BAR|2',
      'POS|0|PITCH|D8|DUR|8',
      'POS|8|PITCH|E8|DUR|8'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 16 },
      { type: 'Pitch', value: 'G7' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 20 },
      { type: 'Pitch', value: 'A7' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 24 },
      { type: 'Pitch', value: 'B7' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 28 },
      { type: 'Pitch', value: 'C8' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'D8' },
      { type: 'Duration', value: 8 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'E8' },
      { type: 'Duration', value: 8 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse underscore-compound tokens with noise fields', () => {
    const input = [
      'Bar_2_pos_0_on_beat_true_pitch_G7_dur_4',
      'Bar_2_pos_4_on_beat_true_pitch_A7_dur_4',
      'Bar_2_pos_8_on_beat_true_pitch_B7_dur_4',
      'Bar_2_pos_12_on_beat_true_pitch_C8_dur_4'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G7' },
      { type: 'Duration', value: 4 },

      { type: 'Bar', value: 2 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'A7' },
      { type: 'Duration', value: 4 },

      { type: 'Bar', value: 2 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'B7' },
      { type: 'Duration', value: 4 },

      { type: 'Bar', value: 2 },
      { type: 'Position', value: 12 },
      { type: 'Pitch', value: 'C8' },
      { type: 'Duration', value: 4 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

  it('should parse well-formed REMI tokens and skip metadata tokens like KEY, INST, TEMPO', () => {
    const input = [
      'START',
      '4/4',
      'KEY:C',
      'INST:Melody',
      'TEMPO:120',
      'BAR:1',
      'POSITION:12',
      'PITCH:C6',
      'DURATION:4',
      'POSITION:16',
      'PITCH:D6',
      'DURATION:4',
      'BAR:2',
      'POSITION:0',
      'PITCH:G6',
      'DURATION:8',
      'END'
    ];

    const expected: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 12 },
      { type: 'Pitch', value: 'C6' },
      { type: 'Duration', value: 4 },
      { type: 'Position', value: 16 },
      { type: 'Pitch', value: 'D6' },
      { type: 'Duration', value: 4 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G6' },
      { type: 'Duration', value: 8 }
    ];

    const result = parseRemiTokens(input);

    expect(result).toEqual(expected);
  });

});
