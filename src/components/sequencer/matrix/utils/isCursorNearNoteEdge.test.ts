import { describe, it, expect } from 'vitest';
import { isCursorNearNoteEdge } from './isCursorNearNoteEdge';
import type { Note } from '@/shared/interfaces/Note';

describe('isCursorNearNoteEdge', () => {
  const makeNote = (start: number, duration: number): Note => ({
    start,
    duration,
    pitch: 'C4',
    velocity: 100
  });

  it('returns true when cursor is within default threshold at right edge', () => {
    const note = makeNote(4, 2); // note spans beats 4–6
    const edgeStart = 4 + 2 * (1 - 0.25); // 5.5
    expect(isCursorNearNoteEdge(5.5, note)).toBe(true);
    expect(isCursorNearNoteEdge(5.75, note)).toBe(true);
    expect(isCursorNearNoteEdge(6, note)).toBe(true);
  });

  it('returns false when cursor is before edge threshold', () => {
    const note = makeNote(4, 2);
    expect(isCursorNearNoteEdge(5.49, note)).toBe(false); // just outside
    expect(isCursorNearNoteEdge(4, note)).toBe(false);
    expect(isCursorNearNoteEdge(3.9, note)).toBe(false);
  });

  it('returns false when cursor is past the note end', () => {
    const note = makeNote(4, 2);
    expect(isCursorNearNoteEdge(6.1, note)).toBe(false);
  });

  it('handles short notes correctly', () => {
    const note = makeNote(10, 0.5);
    const edgeStart = 10 + 0.5 * (1 - 0.25); // 10.375
    expect(isCursorNearNoteEdge(10.4, note)).toBe(true);
    expect(isCursorNearNoteEdge(10.49, note)).toBe(true);
    expect(isCursorNearNoteEdge(10.3, note)).toBe(false);
  });

  it('handles notes of duration 0 as having a 1-point edge zone at start', () => {
    const note = { start: 8, duration: 0, pitch: 'C4', velocity: 100 };
    expect(isCursorNearNoteEdge(8, note)).toBe(true);
    expect(isCursorNearNoteEdge(8.001, note)).toBe(false);
  });

  it('respects a custom threshold', () => {
    const note = makeNote(0, 4);
    // threshold = 0.5 → right half of the note is considered the edge zone
    expect(isCursorNearNoteEdge(2, note, 0.5)).toBe(true);  // at edge start
    expect(isCursorNearNoteEdge(3.99, note, 0.5)).toBe(true);
    expect(isCursorNearNoteEdge(1.99, note, 0.5)).toBe(false); // just outside
  });
});
