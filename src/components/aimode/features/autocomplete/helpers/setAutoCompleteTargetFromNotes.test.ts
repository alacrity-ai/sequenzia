// src/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetFromNotes.test.ts

// npm run test -- src/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetFromNotes.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setAutoCompleteTargetFromNotes } from './setAutoCompleteTargetFromNotes';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';
import type { Note } from '@/shared/interfaces/Note.js';

vi.mock('@/components/aimode/features/autocomplete/stores/autoCompleteStore', () => ({
  setAutoCompleteTargetBeat: vi.fn()
}));

describe('setAutoCompleteTargetFromNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set target beat to furthest forward note end', () => {
    const notes: Note[] = [
      { pitch: 'C3', start: 2, duration: 1 },  // ends at 3
      { pitch: 'E3', start: 5, duration: 2 }   // ends at 7
    ];

    setAutoCompleteTargetFromNotes(notes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(7);
  });

  it('should work with unsorted notes', () => {
    const notes: Note[] = [
      { pitch: 'G3', start: 10, duration: 1 }, // ends at 11
      { pitch: 'C3', start: 2, duration: 1 },  // ends at 3
      { pitch: 'E3', start: 5, duration: 2 }   // ends at 7
    ];

    setAutoCompleteTargetFromNotes(notes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(11);
  });

  it('should do nothing if notes is empty', () => {
    const notes: Note[] = [];

    setAutoCompleteTargetFromNotes(notes);

    expect(setAutoCompleteTargetBeat).not.toHaveBeenCalled();
  });

  it('should handle multiple notes ending at same time', () => {
    const notes: Note[] = [
      { pitch: 'C3', start: 2, duration: 3 }, // ends at 5
      { pitch: 'E3', start: 4, duration: 1 }  // ends at 5
    ];

    setAutoCompleteTargetFromNotes(notes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(5);
  });

  it('should correctly use start + duration for differing durations', () => {
    const notes: Note[] = [
      { pitch: 'C3', start: 2, duration: 4 },  // ends at 6
      { pitch: 'D3', start: 5, duration: 1 },  // ends at 6
      { pitch: 'E3', start: 3, duration: 2 }   // ends at 5
    ];

    setAutoCompleteTargetFromNotes(notes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(6);
  });
});
