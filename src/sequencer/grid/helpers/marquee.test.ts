// src/sequencer/grid/helpers/marquee.test.ts

import { describe, it, expect } from 'vitest';
import { getNotesInMarquee } from './marquee';

describe('getNotesInMarquee', () => {
  const dummyNotes = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'D4', start: 1, duration: 1 },
    { pitch: 'E4', start: 2, duration: 1 },
    { pitch: 'F4', start: 3, duration: 1 },
    { pitch: 'G4', start: 4, duration: 1 },
  ];

  const mockParams = {
    getCellHeight: () => 20,
    getSnappedBeatFromX: (x: number) => x / 20, // 20px per beat
    getPitchFromRow: (row: number) => {
      const pitches = ['G4', 'F4', 'E4', 'D4', 'C4'];
      return pitches[row] ?? 'C4';
    }
  };

  it('should select notes fully inside the marquee', () => {
    const selected = getNotesInMarquee(dummyNotes, {
      ...mockParams,
      startX: 20, currentX: 80, // covers beats 1 to 4
      startY: 0, currentY: 40, // rows 0-2 (G4, F4, E4)
    });

    const selectedPitches = selected.map(n => n.pitch);
    expect(selectedPitches).toContain('E4');
    expect(selectedPitches).toContain('F4');
    expect(selectedPitches).not.toContain('D4');
    expect(selectedPitches).not.toContain('G4');
    expect(selectedPitches).not.toContain('C4');    
  });

  it('should select no notes if marquee does not overlap', () => {
    const selected = getNotesInMarquee(dummyNotes, {
      ...mockParams,
      startX: 100, currentX: 140, // beats 5-7 (out of range)
      startY: 0, currentY: 40,
    });

    expect(selected.length).toBe(0);
  });

  it('should handle marquee drawn backwards (current before start)', () => {
    const selected = getNotesInMarquee(dummyNotes, {
      ...mockParams,
      startX: 80, currentX: 20, // inverted X (normalizes internally)
      startY: 40, currentY: 0,  // inverted Y (normalizes internally)
    });

    const selectedPitches = selected.map(n => n.pitch);
    expect(selectedPitches).toContain('E4');
    expect(selectedPitches).toContain('F4');
    expect(selectedPitches).not.toContain('D4');
  });

  it('should handle empty notes array', () => {
    const selected = getNotesInMarquee([], {
      ...mockParams,
      startX: 0, currentX: 100,
      startY: 0, currentY: 100,
    });

    expect(selected.length).toBe(0);
  });

  it('should guard against invalid midi conversions', () => {
    // Mock getPitchFromRow to return an invalid pitch
    const badParams = {
      ...mockParams,
      getPitchFromRow: (_row: number) => 'InvalidPitch',
    };

    const selected = getNotesInMarquee(dummyNotes, {
      ...badParams,
      startX: 0, currentX: 100,
      startY: 0, currentY: 100,
    });

    expect(selected.length).toBe(0);
  });
});
