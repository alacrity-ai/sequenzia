import { describe, it, expect } from 'vitest';
import { pruneNotesToTimeline } from './pruneNotesToTimeline';
import type { Note } from '../../../shared/interfaces/Note';

const makeNote = (start: number, duration: number): Note => ({
  start,
  duration,
  pitch: 'C4',
  velocity: 100
});

describe('pruneNotesToTimeline', () => {
  it('returns notes that are fully inside the timeline unchanged', () => {
    const notes: Note[] = [makeNote(4, 2), makeNote(8, 1)];
    const result = pruneNotesToTimeline(notes, 16);
    expect(result).toEqual(notes);
  });

  it('excludes notes that start at or after totalBeats', () => {
    const notes: Note[] = [makeNote(15, 1), makeNote(16, 1), makeNote(17, 2)];
    const result = pruneNotesToTimeline(notes, 16);
    expect(result.length).toBe(1);
    expect(result[0].start).toBe(15);
  });

  it('truncates notes that extend past totalBeats', () => {
    const notes: Note[] = [makeNote(14, 4), makeNote(15.5, 2)];
    const result = pruneNotesToTimeline(notes, 16);

    expect(result[0]).toEqual({ ...notes[0], duration: 2 });
    expect(result[1]).toEqual({ ...notes[1], duration: 0.5 });
  });

  it('handles notes ending exactly at totalBeats correctly', () => {
    const notes: Note[] = [makeNote(10, 6)]; // 10 + 6 = 16
    const result = pruneNotesToTimeline(notes, 16);
    expect(result[0]).toEqual(notes[0]); // unchanged
  });

  it('returns empty array if all notes are out of bounds', () => {
    const notes: Note[] = [makeNote(20, 2), makeNote(18, 1)];
    const result = pruneNotesToTimeline(notes, 16);
    expect(result).toEqual([]);
  });

  it('handles zero-duration notes gracefully', () => {
    const notes: Note[] = [makeNote(10, 0)];
    const result = pruneNotesToTimeline(notes, 16);
    expect(result).toEqual(notes);
  });
});
