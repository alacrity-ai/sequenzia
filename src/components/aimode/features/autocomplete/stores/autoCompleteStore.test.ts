// src/components/aimode/features/autocomplete/stores/autoCompleteStore.test.ts

// npm run test -- src/components/aimode/features/autocomplete/stores/autoCompleteStore.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getIsAutocompleteEnabled,
  setIsAutocompleteEnabled,
  toggleIsAutocompleteEnabled,
  subscribeAutocompleteState,
  clearAutocompleteListeners,
  setAIPreviewNotes,
  getAIPreviewNotes,
  clearAIPreviewNotes
} from './autoCompleteStore';

import type { Note } from '@/shared/interfaces/Note';

describe('autoCompleteStore', () => {
  afterEach(() => {
    // Reset state after each test
    setIsAutocompleteEnabled(false);
    clearAIPreviewNotes();
    clearAutocompleteListeners();
  });

  describe('Autocomplete Enabled State', () => {
    it('should toggle autocomplete state', () => {
      expect(getIsAutocompleteEnabled()).toBe(false);

      toggleIsAutocompleteEnabled();
      expect(getIsAutocompleteEnabled()).toBe(true);

      toggleIsAutocompleteEnabled();
      expect(getIsAutocompleteEnabled()).toBe(false);
    });

    it('should set autocomplete state explicitly', () => {
      setIsAutocompleteEnabled(true);
      expect(getIsAutocompleteEnabled()).toBe(true);

      setIsAutocompleteEnabled(false);
      expect(getIsAutocompleteEnabled()).toBe(false);
    });

    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      subscribeAutocompleteState(listener);

      // Should be notified immediately on subscribe
      expect(listener).toHaveBeenCalledWith(false);

      setIsAutocompleteEnabled(true);
      expect(listener).toHaveBeenCalledWith(true);

      setIsAutocompleteEnabled(false);
      expect(listener).toHaveBeenCalledWith(false);
    });

    it('should not notify listeners if state is unchanged', () => {
      const listener = vi.fn();
      subscribeAutocompleteState(listener);

      setIsAutocompleteEnabled(false); // same as initial
      expect(listener).toHaveBeenCalledTimes(1); // only initial call
    });

    it('should clear listeners', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeAutocompleteState(listener);

      unsubscribe(); // remove listener
      setIsAutocompleteEnabled(true);

      expect(listener).toHaveBeenCalledTimes(1); // only initial notify
    });
  });

  describe('AI Preview Notes', () => {
    const mockNotes: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 80 },
      { pitch: 'E4', start: 1, duration: 1, velocity: 90 }
    ];

    it('should set and get AI preview notes', () => {
      expect(getAIPreviewNotes()).toEqual([]);

      setAIPreviewNotes(mockNotes);
      expect(getAIPreviewNotes()).toEqual(mockNotes);
    });

    it('should clear AI preview notes', () => {
      setAIPreviewNotes(mockNotes);
      clearAIPreviewNotes();

      expect(getAIPreviewNotes()).toEqual([]);
    });
  });
});
