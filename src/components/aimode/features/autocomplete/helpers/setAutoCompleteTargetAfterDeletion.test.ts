// src/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetAfterDeletion.test.ts

// npm run test -- src/components/aimode/features/autocomplete/helpers/setAutoCompleteTargetAfterDeletion.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setAutoCompleteTargetAfterDeletion } from './setAutoCompleteTargetAfterDeletion';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';
import type { Note } from '@/shared/interfaces/Note.js';

vi.mock('@/components/aimode/features/autocomplete/stores/autoCompleteStore', () => ({
  setAutoCompleteTargetBeat: vi.fn()
}));

describe('setAutoCompleteTargetAfterDeletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set target beat to end of prior existing note', () => {
    const deletedNotes: Note[] = [{ pitch: 'G3', start: 8, duration: 1 }];
    const remainingNotes: Note[] = [
      { pitch: 'C3', start: 2, duration: 1 },
      { pitch: 'F3', start: 5, duration: 2 } // ends at 7
    ];

    setAutoCompleteTargetAfterDeletion(deletedNotes, remainingNotes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(7);
  });

  it('should fallback to 0 if no prior notes exist', () => {
    const deletedNotes: Note[] = [{ pitch: 'D3', start: 2, duration: 1 }];
    const remainingNotes: Note[] = [
      { pitch: 'E3', start: 4, duration: 1 }, // after deletion window, not prior
    ];

    setAutoCompleteTargetAfterDeletion(deletedNotes, remainingNotes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(0);
  });

  it('should pick the furthest forward prior note', () => {
    const deletedNotes: Note[] = [{ pitch: 'A3', start: 10, duration: 1 }];
    const remainingNotes: Note[] = [
      { pitch: 'C3', start: 2, duration: 1 },  // ends at 3
      { pitch: 'D3', start: 5, duration: 2 },  // ends at 7
      { pitch: 'E3', start: 7, duration: 2 }   // ends at 9
    ];

    setAutoCompleteTargetAfterDeletion(deletedNotes, remainingNotes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(9);
  });

  it('should do nothing if deletedNotes is empty', () => {
    const deletedNotes: Note[] = [];
    const remainingNotes: Note[] = [
      { pitch: 'C3', start: 2, duration: 1 },
    ];

    setAutoCompleteTargetAfterDeletion(deletedNotes, remainingNotes);

    expect(setAutoCompleteTargetBeat).not.toHaveBeenCalled();
  });

  it('should not consider remaining notes at deletedStart as prior', () => {
    const deletedNotes: Note[] = [{ pitch: 'E3', start: 4, duration: 1 }];
    const remainingNotes: Note[] = [
      { pitch: 'F3', start: 4, duration: 1 }, // not "before" deletedStart
      { pitch: 'C3', start: 1, duration: 1 }  // ends at 2
    ];

    setAutoCompleteTargetAfterDeletion(deletedNotes, remainingNotes);

    expect(setAutoCompleteTargetBeat).toHaveBeenCalledWith(2);
  });
});
