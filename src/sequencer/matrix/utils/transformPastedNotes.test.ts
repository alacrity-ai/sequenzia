import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformPastedNotes } from './transformPastedNotes';
import type { Note } from '../../../shared/interfaces/Note.js';
import { getTotalBeats } from '../../transport.js';

// Mock getTotalBeats
vi.mock('../../transport.js', () => ({
  getTotalBeats: vi.fn()
}));

// @ts-ignore
const mockedGetTotalBeats = getTotalBeats as vi.Mock;

describe('transformPastedNotes', () => {
  beforeEach(() => {
    mockedGetTotalBeats.mockReturnValue(32); // assume 32-beat grid
  });

  const baseNotes: Note[] = [
    { pitch: 'C4', start: 4, duration: 2, velocity: 100 },
    { pitch: 'E4', start: 6, duration: 2, velocity: 100 },
    { pitch: 'G4', start: 8, duration: 2, velocity: 100 },
  ];

  it('shifts notes correctly when no clamping is needed', () => {
    const result = transformPastedNotes({
      notes: baseNotes,
      anchorBeat: 4,
      anchorMidi: 60, // C4
      targetBeat: 10,
      targetMidi: 67, // G4
      lowestMidi: 48,
      highestMidi: 84
    });

    expect(result).toEqual([
      { pitch: 'G4', start: 10, duration: 2, velocity: 100 },
      { pitch: 'B4', start: 12, duration: 2, velocity: 100 },
      { pitch: 'D5', start: 14, duration: 2, velocity: 100 }
    ]);
  });

  it('clamps notes that go below lowestMidi', () => {
    const result = transformPastedNotes({
      notes: baseNotes,
      anchorBeat: 4,
      anchorMidi: 60, // C4
      targetBeat: 0,
      targetMidi: 48, // C3 (will push some below)
      lowestMidi: 48,
      highestMidi: 84
    });

    expect(result).toEqual([
      { pitch: 'C3', start: 0, duration: 2, velocity: 100 },
      { pitch: 'E3', start: 2, duration: 2, velocity: 100 },
      { pitch: 'G3', start: 4, duration: 2, velocity: 100 }
    ]);
  });

  it('clamps notes that exceed total beats', () => {
    mockedGetTotalBeats.mockReturnValue(12);

    const result = transformPastedNotes({
      notes: baseNotes,
      anchorBeat: 4,
      anchorMidi: 60,
      targetBeat: 10,
      targetMidi: 60,
      lowestMidi: 48,
      highestMidi: 84
    });

    // shift would push the last note to start at 14, which exceeds maxEnd = 16 -> clamp back
    // maxEnd = start + duration = 14 + 2 = 16 -> over by 4 -> clamp deltaBeats -4
    expect(result).toEqual([
      { pitch: 'C4', start: 6, duration: 2, velocity: 100 },
      { pitch: 'E4', start: 8, duration: 2, velocity: 100 },
      { pitch: 'G4', start: 10, duration: 2, velocity: 100 }
    ]);
  });

  it('does not produce notes if pitch conversion fails', () => {
    const badNotes: Note[] = [
      { pitch: 'H#4' as any, start: 0, duration: 1, velocity: 100 }
    ];

    const result = transformPastedNotes({
      notes: badNotes,
      anchorBeat: 0,
      anchorMidi: 60,
      targetBeat: 2,
      targetMidi: 62,
      lowestMidi: 0,
      highestMidi: 127
    });

    expect(result).toEqual([]);
  });

  it('handles empty note list gracefully', () => {
    const result = transformPastedNotes({
      notes: [],
      anchorBeat: 0,
      anchorMidi: 60,
      targetBeat: 4,
      targetMidi: 64,
      lowestMidi: 48,
      highestMidi: 84
    });

    expect(result).toEqual([]);
  });
});
