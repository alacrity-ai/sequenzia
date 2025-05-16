// src/components/sequencer/matrix/__mocks__/createMockInteractionStore.ts

import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore';
import type { SnappedNotePosition } from '@/components/sequencer/matrix/interfaces/SnappedNotePosition';
import type { SelectionBox } from '@/components/sequencer/matrix/interfaces/SelectionBox';
import type { Note } from '@/shared/interfaces/Note';
import { vi } from 'vitest';

/**
 * Factory function to create a full mock InteractionStore.
 * Internally stateful, but all methods observable with vi.fn.
 */
export function createMockInteractionStore(): InteractionStore {
  let snappedCursorGridPosition: SnappedNotePosition | null = null;
  let previewNotes: Note[] = [];
  let hoveredNoteKey: string | null = null;
  let marqueeBox: SelectionBox | null = null;
  let highlightedNoteKeys = new Set<string>();
  let suppressNextMouseUp = false;
  let selectedNotes: Note[] = [];
  let dragAnchorNoteKey: string | null = null;
  let isOnScrollbar = false;
  let isScrolling = false;
  let isInitiatingSelectionDrag = false;
  let isDraggingNotes = false;
  let lastDeletionTime = 0;

  const store = {
    // Snapped cursor
    setSnappedCursorGridPosition: vi.fn((pos: SnappedNotePosition | null) => {
      snappedCursorGridPosition = pos;
    }),
    getSnappedCursorGridPosition: vi.fn(() => snappedCursorGridPosition),

    // Preview notes
    setPreviewNotes: vi.fn((notes: Note[]) => {
      previewNotes = notes;
    }),
    getPreviewNotes: vi.fn(() => previewNotes),
    clearPreviewNotes: vi.fn(() => {
      previewNotes = [];
    }),

    // Hover
    setHoveredNoteKey: vi.fn((key: string | null) => {
      hoveredNoteKey = key;
    }),
    getHoveredNoteKey: vi.fn(() => hoveredNoteKey),

    // Marquee
    setMarqueeBox: vi.fn((box: SelectionBox | null) => {
      marqueeBox = box;
    }),
    getMarqueeBox: vi.fn(() => marqueeBox),
    hasMarquee: vi.fn(() => marqueeBox !== null),

    // Highlighted
    setHighlightedNotes: vi.fn((notes: Note[]) => {
      highlightedNoteKeys = new Set(notes.map(n => `${n.pitch}:${n.start}`));
    }),
    clearHighlightedNotes: vi.fn(() => {
      highlightedNoteKeys.clear();
    }),
    isNoteHighlighted: vi.fn((note: Note) =>
      highlightedNoteKeys.has(`${note.pitch}:${note.start}`)
    ),

    // Suppress mouseup
    suppressNextMouseUpEvent: vi.fn(() => {
      suppressNextMouseUp = true;
    }),
    consumeSuppressMouseUpFlag: vi.fn(() => {
      const result = suppressNextMouseUp;
      suppressNextMouseUp = false;
      return result;
    }),

    // Selection
    getSelectedNotes: vi.fn(() => selectedNotes),
    setSelectedNotes: vi.fn((notes: Note[]) => {
      selectedNotes = notes;
    }),
    clearSelection: vi.fn(() => {
      selectedNotes = [];
    }),
    hasSelection: vi.fn(() => selectedNotes.length > 0),

    // Drag anchor
    setDragAnchorNoteKey: vi.fn((key: string | null) => {
      dragAnchorNoteKey = key;
    }),
    getDragAnchorNoteKey: vi.fn(() => dragAnchorNoteKey),

    // UI boundaries
    setIsOnScrollbar: vi.fn((val: boolean) => {
      isOnScrollbar = val;
    }),
    getIsOnScrollbar: vi.fn(() => isOnScrollbar),
    setIsScrolling: vi.fn((val: boolean) => {
      isScrolling = val;
    }),
    isOnNonGridElement: vi.fn(() => isOnScrollbar || isScrolling),

    // Selection drag
    beginSelectionDrag: vi.fn(() => {
      isInitiatingSelectionDrag = true;
    }),
    endSelectionDrag: vi.fn(() => {
      isInitiatingSelectionDrag = false;
    }),
    isDraggingToSelect: vi.fn(() => isInitiatingSelectionDrag),

    // Dragging notes
    setIsDraggingNotes: vi.fn((val: boolean) => {
      isDraggingNotes = val;
    }),
    getIsDraggingNotes: vi.fn(() => isDraggingNotes),
    isActivelyDragging: vi.fn(() => isDraggingNotes || isInitiatingSelectionDrag),

    // Deletion
    setLastDeletionTime: vi.fn(() => {
      lastDeletionTime = performance.now();
    }),
    getLastDeletionTime: vi.fn(() => lastDeletionTime)
  } as unknown as InteractionStore;

  return store;
}
