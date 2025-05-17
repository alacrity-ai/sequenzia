// src/components/sequencer/matrix/input/stores/InteractionStore.test.ts

// npm run test -- src/components/sequencer/matrix/input/stores/InteractionStore.test.ts

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { InteractionStore } from './InteractionStore';
import type { Note } from '@/shared/interfaces/Note';
import type { SnappedNotePosition } from '@/components/sequencer/matrix/interfaces/SnappedNotePosition';
import type { SelectionBox } from '@/components/sequencer/matrix/interfaces/SelectionBox';

// Mock setAutoCompleteTargetBeatByNotes
vi.mock('@/components/aimode/features/autocomplete/stores/autoCompleteStore', () => ({
  setAutoCompleteTargetBeatByNotes: vi.fn(),
}));

const { setAutoCompleteTargetBeatByNotes } = await import('@/components/aimode/features/autocomplete/stores/autoCompleteStore');

describe('InteractionStore', () => {
  let store: InteractionStore;

  beforeEach(() => {
    store = new InteractionStore();
    vi.clearAllMocks();
  });

  it('should set and get snapped cursor position', () => {
    const pos: SnappedNotePosition = { x: 3.5, y: 2 };
    store.setSnappedCursorGridPosition(pos);
    expect(store.getSnappedCursorGridPosition()).toEqual(pos);

    store.setSnappedCursorGridPosition(null);
    expect(store.getSnappedCursorGridPosition()).toBeNull();
  });

  it('should set, get, and clear preview notes', () => {
    const notes: Note[] = [{ pitch: 'D#5', start: 2, duration: 1 }];
    store.setPreviewNotes(notes);
    expect(store.getPreviewNotes()).toEqual(notes);

    store.clearPreviewNotes();
    expect(store.getPreviewNotes()).toEqual([]);
  });

  it('should set and get hovered note key', () => {
    store.setHoveredNoteKey('C4:1');
    expect(store.getHoveredNoteKey()).toBe('C4:1');

    store.setHoveredNoteKey(null);
    expect(store.getHoveredNoteKey()).toBeNull();
  });

  it('should set, get, and check marquee box', () => {
    const box: SelectionBox = {
      startX: 10,
      startY: 20,
      currentX: 110,
      currentY: 70,
      readonly: false,
      pixelToGrid: true,
    };

    store.setMarqueeBox(box);
    expect(store.getMarqueeBox()).toEqual(box);
    expect(store.hasMarquee()).toBe(true);

    store.setMarqueeBox(null);
    expect(store.getMarqueeBox()).toBeNull();
    expect(store.hasMarquee()).toBe(false);
  });

  it('should set, clear, and check highlighted notes', () => {
    const notes: Note[] = [{ pitch: 'E3', start: 0, duration: 1 }, { pitch: 'G3', start: 1, duration: 1 }];
    store.setHighlightedNotes(notes);

    expect(store.isNoteHighlighted({ pitch: 'E3', start: 0, duration: 1 })).toBe(true);
    expect(store.isNoteHighlighted({ pitch: 'G3', start: 1, duration: 1 })).toBe(true);
    expect(store.isNoteHighlighted({ pitch: 'A3', start: 2, duration: 1 })).toBe(false);

    store.clearHighlightedNotes();
    expect(store.isNoteHighlighted({ pitch: 'E3', start: 0, duration: 1 })).toBe(false);
  });

  it('should manage suppressNextMouseUp flag correctly', () => {
    expect(store.consumeSuppressMouseUpFlag()).toBe(false);

    store.suppressNextMouseUpEvent();
    expect(store.consumeSuppressMouseUpFlag()).toBe(true);
    expect(store.consumeSuppressMouseUpFlag()).toBe(false);
  });

  it('should manage selected notes and trigger autocomplete hook', () => {
    const notes: Note[] = [{ pitch: 'C4', start: 0, duration: 1 }];
    store.setSelectedNotes(notes);

    expect(store.getSelectedNotes()).toEqual(notes);
    expect(setAutoCompleteTargetBeatByNotes).toHaveBeenCalledWith(notes);

    store.clearSelection();
    expect(store.getSelectedNotes()).toEqual([]);
    expect(store.hasSelection()).toBe(false);

    store.setSelectedNotes(notes);
    expect(store.hasSelection()).toBe(true);
  });

  it('should set and get drag anchor note key', () => {
    store.setDragAnchorNoteKey('G4:3');
    expect(store.getDragAnchorNoteKey()).toBe('G4:3');

    store.setDragAnchorNoteKey(null);
    expect(store.getDragAnchorNoteKey()).toBeNull();
  });

  it('should track isOnScrollbar and isScrolling flags', () => {
    store.setIsOnScrollbar(true);
    expect(store.getIsOnScrollbar()).toBe(true);

    store.setIsOnScrollbar(false);
    expect(store.getIsOnScrollbar()).toBe(false);

    store.setIsScrolling(true);
    expect(store.isOnNonGridElement()).toBe(true);

    store.setIsScrolling(false);
    expect(store.isOnNonGridElement()).toBe(false);
  });

  it('should track selection drag state', () => {
    expect(store.isDraggingToSelect()).toBe(false);

    store.beginSelectionDrag();
    expect(store.isDraggingToSelect()).toBe(true);

    store.endSelectionDrag();
    expect(store.isDraggingToSelect()).toBe(false);
  });

  it('should track isDraggingNotes and isActivelyDragging', () => {
    expect(store.isActivelyDragging()).toBe(false);

    store.setIsDraggingNotes(true);
    expect(store.getIsDraggingNotes()).toBe(true);
    expect(store.isActivelyDragging()).toBe(true);

    store.setIsDraggingNotes(false);
    expect(store.getIsDraggingNotes()).toBe(false);

    store.beginSelectionDrag();
    expect(store.isActivelyDragging()).toBe(true);

    store.endSelectionDrag();
    expect(store.isActivelyDragging()).toBe(false);
  });

  it('should manage last deletion time', () => {
    const mockPerfNow = vi.spyOn(performance, 'now').mockReturnValue(1234567890);

    store.setLastDeletionTime();
    expect(store.getLastDeletionTime()).toBe(1234567890);

    mockPerfNow.mockRestore();
  });

  it('should not call autocomplete hook when setting empty selected notes', () => {
    store.setSelectedNotes([]);
    expect(setAutoCompleteTargetBeatByNotes).not.toHaveBeenCalled();
    expect(store.getSelectedNotes()).toEqual([]);
  });

  it('should report being on non-grid element if either scrollbar or scrolling is active', () => {
    store.setIsOnScrollbar(true);
    store.setIsScrolling(false);
    expect(store.isOnNonGridElement()).toBe(true);

    store.setIsOnScrollbar(false);
    store.setIsScrolling(true);
    expect(store.isOnNonGridElement()).toBe(true);

    store.setIsOnScrollbar(false);
    store.setIsScrolling(false);
    expect(store.isOnNonGridElement()).toBe(false);
  });
});
