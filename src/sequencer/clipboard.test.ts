import { describe, it, expect, beforeEach } from 'vitest';
import { setClipboard, getClipboard } from './clipboard';
import { Note } from './interfaces/Note';

describe('clipboard.ts', () => {
  beforeEach(() => {
    // Clear clipboard before each test by setting it to empty
    setClipboard([]);
  });

  it('should initialize clipboard with empty notes if given no input', () => {
    setClipboard([]);
    const clipboard = getClipboard();
    expect(clipboard.notes).toEqual([]);
    expect(clipboard.anchorBeat).toBe(0);
    expect(clipboard.anchorMidi).toBe(0);
  });

  it('should set clipboard correctly with provided notes', () => {
    const notes: Note[] = [
      { pitch: 'C4', start: 2, duration: 1 },
      { pitch: 'E4', start: 3, duration: 1 },
      { pitch: 'G4', start: 4, duration: 1 },
    ];

    setClipboard(notes);
    const clipboard = getClipboard();

    expect(clipboard.notes.length).toBe(3);
    expect(clipboard.anchorBeat).toBe(2);
    expect(typeof clipboard.anchorMidi).toBe('number');
    expect(clipboard.notes[0]).toEqual({ pitch: 'C4', start: 2, duration: 1 });
    expect(clipboard.notes[1]).toEqual({ pitch: 'E4', start: 3, duration: 1 });
    expect(clipboard.notes[2]).toEqual({ pitch: 'G4', start: 4, duration: 1 });
  });

  it('should clone notes into clipboard without modifying original notes', () => {
    const originalNotes: Note[] = [
      { pitch: 'D4', start: 1, duration: 1.5 },
    ];

    setClipboard(originalNotes);
    const clipboard = getClipboard();

    // Modify original after setting
    originalNotes[0].start = 999;

    // Clipboard should not reflect the modification
    expect(clipboard.notes[0].start).toBe(1);
  });
});
