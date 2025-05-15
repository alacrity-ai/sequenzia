// src/components/sequencer/matrix/utils/createNoteVisibilityFilter.test.ts

// npm run test -- src/components/sequencer/matrix/utils/createNoteVisibilityFilter.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVisibleNotesFilter } from '@/components/sequencer/matrix/utils/createNoteVisibilityFilter.js';
import { noteToRowIndex } from '@/shared/utils/musical/noteUtils.js';

import type { Mock } from 'vitest';

vi.mock('@/shared/utils/musical/noteUtils.js', () => ({
  noteToRowIndex: vi.fn(),
}));

describe('createVisibleNotesFilter', () => {
  const config = {
    layout: {
      baseCellWidth: 10,
      verticalCellRatio: 2,
      highestMidi: 72,
      lowestMidi: 60,
    },
    behavior: {
      zoom: 1,
    },
  } as any;

  const canvas = {
    offsetWidth: 100,  // viewport 10 cells wide
    offsetHeight: 100, // viewport 20 rows high
  } as HTMLCanvasElement;

  beforeEach(() => {
    vi.clearAllMocks();
    (noteToRowIndex as Mock).mockImplementation((pitch: string) => {
      const map: Record<string, number> = {
        'C4': 0,  // highest pitch
        'D4': 1,
        'E4': 2,
        'F4': 3,
        'G4': 4,
      };
      return map[pitch] ?? null;
    });
  });

  it('should include notes within visible horizontal & vertical bounds', () => {
    const filter = createVisibleNotesFilter(0, 0, config, canvas);

    const notes = [
      { note: { start: 5, duration: 1, pitch: 'C4' } },
      { note: { start: 2, duration: 2, pitch: 'D4' } },
    ] as any;

    const result = filter(notes);

    expect(result).toHaveLength(2);
  });

  it('should exclude notes outside horizontal bounds', () => {
    const filter = createVisibleNotesFilter(0, 0, config, canvas);

    const notes = [
      { note: { start: -10, duration: 2, pitch: 'C4' } },  // left of viewport
      { note: { start: 15, duration: 1, pitch: 'D4' } },   // right of viewport (viewport endX = 10)
    ] as any;

    const result = filter(notes);

    expect(result).toHaveLength(0);
  });

  it('should exclude notes outside vertical bounds', () => {
    const filter = createVisibleNotesFilter(0, 0, config, canvas);

    const notes = [
      { note: { start: 5, duration: 1, pitch: 'InvalidPitch' } }, // noteToRowIndex returns null
    ] as any;

    const result = filter(notes);

    expect(result).toHaveLength(0);
  });

  it('should cache pitch to row index after first lookup', () => {
    const filter = createVisibleNotesFilter(0, 0, config, canvas);

    const notes = [
      { note: { start: 2, duration: 1, pitch: 'C4' } },
      { note: { start: 3, duration: 1, pitch: 'C4' } }, // repeated pitch should hit cache
    ] as any;

    filter(notes);

    expect(noteToRowIndex).toHaveBeenCalledTimes(1); // only 1 pitch mapping call for 'C4'
  });

  it('should correctly handle viewport bounds edge cases', () => {
    const filter = createVisibleNotesFilter(0, 0, config, canvas);

    const notes = [
      { note: { start: 0, duration: 1, pitch: 'C4' } },  // start at left edge
      { note: { start: 10, duration: 0, pitch: 'D4' } }, // right at endX boundary (should be included)
    ] as any;

    const result = filter(notes);

    expect(result).toHaveLength(2);
  });
});
