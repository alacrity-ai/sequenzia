// src/shared/utils/musical/songUtils.test.ts

// npm run test -- src/shared/utils/musical/songUtils.test.ts

import { describe, it, expect } from 'vitest';
import { formatSongKey } from '@/shared/utils/musical/songUtils';

describe('formatSongKey', () => {
  it('should format single-letter keys as Major', () => {
    expect(formatSongKey('C')).toBe('C Major');
    expect(formatSongKey('A')).toBe('A Major');
    expect(formatSongKey('F')).toBe('F Major');
  });

  it('should format keys with lowercase m as Minor', () => {
    expect(formatSongKey('Am')).toBe('A Minor');
    expect(formatSongKey('Dm')).toBe('D Minor');
    expect(formatSongKey('gm')).toBe('G Minor');
  });

  it('should handle uppercase M suffix as Major', () => {
    expect(formatSongKey('CM')).toBe('C Major');
    expect(formatSongKey('EM')).toBe('E Major');
  });

  it('should normalize casing consistently', () => {
    expect(formatSongKey('am')).toBe('A Minor');
    expect(formatSongKey('bM')).toBe('B Major');
    expect(formatSongKey('gM')).toBe('G Major');
  });

  it('should handle malformed input defensively', () => {
    expect(formatSongKey('')).toBe('Unknown Key');
    expect(formatSongKey(' ')).toBe('Unknown Key');
    expect(formatSongKey(null as unknown as string)).toBe('Unknown Key');
    expect(formatSongKey(undefined as unknown as string)).toBe('Unknown Key');
  });

  it('should fallback to Major if no minor marker present', () => {
    expect(formatSongKey('D')).toBe('D Major');
    expect(formatSongKey('F')).toBe('F Major');
  });

  it('should handle weird inputs gracefully', () => {
    expect(formatSongKey('weird')).toBe('WEIR Major');
    expect(formatSongKey('Qm')).toBe('Q Minor');
    expect(formatSongKey('Xm')).toBe('X Minor');
  });
});
