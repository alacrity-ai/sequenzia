import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformDraggedNotes } from './transformDraggedNotes';
import type { Note } from '../../../shared/interfaces/Note';
import { getTotalBeats } from '../../transport';

vi.mock('../../transport', () => ({
  getTotalBeats: vi.fn(() => 16)
}));

const makeNote = (pitch: string, start: number, duration: number): Note => ({
  pitch,
  start,
  duration,
  velocity: 100
});

describe('transformDraggedNotes', () => {
  const baseNotes: Note[] = [
    makeNote('C4', 2, 1),
    makeNote('D4', 3, 2)
  ];

  const anchor = baseNotes[0];

  const sharedParams = {
    originalNotes: baseNotes,
    anchorNote: anchor,
    lowestMidi: 21,
    highestMidi: 108
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    (getTotalBeats as vi.Mock).mockReturnValue(16);
  });

  it('shifts notes horizontally and vertically when dragged', () => {
    const result = transformDraggedNotes({
      ...sharedParams,
      targetPitch: 'E4',  // C4 → E4 = +4 semitones
      targetBeat: 4       // 2 → 4 = +2 beats
    });

    expect(result).toEqual([
      { pitch: 'E4', start: 4, duration: 1, velocity: 100 },
      { pitch: 'F#4', start: 5, duration: 2, velocity: 100 }
    ]);
  });

  it('clamps notes above highestMidi', () => {
    const highNotes = [
      makeNote('G8', 14, 2) // G8 = 115
    ];
    const result = transformDraggedNotes({
      originalNotes: highNotes,
      anchorNote: highNotes[0],
      targetPitch: 'C9',  // absurdly high
      targetBeat: 15,
      lowestMidi: 21,
      highestMidi: 108
    });

    expect(result[0].pitch).toBe('C8'); // 108 = C8
  });

  it('clamps notes below lowestMidi', () => {
    const lowNotes = [
      makeNote('C3', 1, 1) // C3 = 48
    ];
    const result = transformDraggedNotes({
      originalNotes: lowNotes,
      anchorNote: lowNotes[0],
      targetPitch: 'A0',  // A0 = 21
      targetBeat: 0,
      lowestMidi: 21,
      highestMidi: 108
    });

    expect(result[0].pitch).toBe('A0');
  });

  it('clamps notes to stay within time bounds of grid', () => {
    const notes = [
      makeNote('C4', 0, 2),
      makeNote('D4', 1, 2)
    ];

    const result = transformDraggedNotes({
      originalNotes: notes,
      anchorNote: notes[0],
      targetPitch: 'C4',
      targetBeat: 15.5, // shift would move second note end past beat 17
      lowestMidi: 21,
      highestMidi: 108
    });

    // Second note gets clamped to end at 16
    expect(result[1].start + result[1].duration).toBeLessThanOrEqual(16);
  });

  it('does nothing if target and anchor are same pitch/beat', () => {
    const result = transformDraggedNotes({
      ...sharedParams,
      targetPitch: anchor.pitch,
      targetBeat: anchor.start
    });

    expect(result).toEqual([
      { pitch: 'C4', start: 2, duration: 1, velocity: 100 },
      { pitch: 'D4', start: 3, duration: 2, velocity: 100 }
    ]);
  });

  it('returns empty array if target pitch is invalid', () => {
    const result = transformDraggedNotes({
      ...sharedParams,
      targetPitch: 'INVALID',
      targetBeat: 4
    });

    expect(result).toEqual([]);
  });

  it('returns empty if anchor note pitch is invalid', () => {
    const result = transformDraggedNotes({
      originalNotes: baseNotes,
      anchorNote: { ...anchor, pitch: '???' },
      targetPitch: 'C4',
      targetBeat: 4,
      lowestMidi: 21,
      highestMidi: 108
    });

    expect(result).toEqual([]);
  });
});
