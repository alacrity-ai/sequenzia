// src/shared/utils/musical/tonal/songKeyNotes.test.ts

// npm run test -- src/shared/utils/musical/tonal/songKeyNotes.test.ts

import { describe, it, expect } from 'vitest';
import { getNotesForSongKey } from './songKeyNotes';
import type { SongKey } from '@/shared/types/SongKey';

describe('getNotesForSongKey', () => {
  it('returns correct notes for CM (C major)', () => {
    const result = getNotesForSongKey('CM');
    expect(result).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('returns correct notes for Am (A minor)', () => {
    const result = getNotesForSongKey('Am');
    expect(result).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('returns correct notes for F#m (F# minor)', () => {
    const result = getNotesForSongKey('F#m');
    expect(result).toEqual(['F#', 'G#', 'A', 'B', 'C#', 'D', 'E']);
  });

  it('returns correct notes for EbM (Eb major)', () => {
    const result = getNotesForSongKey('EbM');
    expect(result).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
  });

  it('returns correct notes for C#m (C# minor)', () => {
    const result = getNotesForSongKey('C#m');
    expect(result).toEqual(['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B']);
  });

  it('returns null for an invalid key (e.g., XZ)', () => {
    const result = getNotesForSongKey('XZ' as SongKey);
    expect(result).toBeNull();
  });

  it('returns null for a valid letter with an invalid mode (e.g., Cq)', () => {
    const result = getNotesForSongKey('Cq' as SongKey);
    expect(result).toBeNull();
  });
});
