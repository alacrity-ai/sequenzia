// src/components/sequencer/matrix/input/handlers/PastingToolHandler.test.ts


// npm run test -- src/components/sequencer/matrix/input/handlers/PastingToolHandler.test.ts

import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { createMockPastingToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockPastingToolHandler';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState';

import * as snappingUtils from '@/components/sequencer/matrix/utils/snapping.js';
import * as gridGuards from '@/components/sequencer/matrix/utils/gridGuards.js';
import { recordDiff } from '@/appState/appState';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '@/appState/diffEngine/types/grid/placeNotes';
import { transformPastedNotes } from '@/components/sequencer/matrix/utils/transformPastedNotes';

// === Global mocks ===
vi.mock('@/components/sequencer/matrix/utils/snapping.js', async () => {
  const actual = await vi.importActual<typeof import('@/components/sequencer/matrix/utils/snapping.js')>(
    '@/components/sequencer/matrix/utils/snapping.js'
  );
  return {
    ...actual,
    getSnappedFromEvent: vi.fn(() => ({ x: 1, y: 2 }))
  };
});

vi.mock('@/components/sequencer/matrix/utils/gridGuards.js', async () => {
  const actual = await vi.importActual<typeof import('@/components/sequencer/matrix/utils/gridGuards.js')>(
    '@/components/sequencer/matrix/utils/gridGuards.js'
  );
  return {
    ...actual,
    abortIfOutOfGridBounds: vi.fn(() => false)
  };
});

vi.mock('@/appState/appState', () => ({
  recordDiff: vi.fn()
}));

vi.mock('@/appState/diffEngine/types/grid/placeNotes', () => ({
  createPlaceNotesDiff: vi.fn(() => 'mockDiff'),
  createReversePlaceNotesDiff: vi.fn(() => 'mockReverseDiff')
}));

vi.mock('@/components/sequencer/matrix/utils/transformPastedNotes', () => ({
  transformPastedNotes: vi.fn(() => [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }])
}));

const mockFn = <T extends (...args: any[]) => any>(
  fn: T
): MockInstance<T> => fn as unknown as MockInstance<T>;


// === Test suite ===
describe('PastingToolHandler - Behavior', () => {
  let handler: ReturnType<typeof createMockPastingToolHandler>['handler'];
  let store: ReturnType<typeof createMockPastingToolHandler>['store'];
  let controller: ReturnType<typeof createMockPastingToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockPastingToolHandler>['cursorController'];
  let requestRedraw: ReturnType<typeof createMockPastingToolHandler>['requestRedraw'];
  let getClipboard: ReturnType<typeof createMockPastingToolHandler>['getClipboard'];

  beforeEach(() => {
    const mocks = createMockPastingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
    requestRedraw = mocks.requestRedraw;
    getClipboard = mocks.getClipboard;
  });

  describe('onMouseMove', () => {
    it('should update preview notes and request redraw', () => {
      getClipboard.mockReturnValue({
        notes: [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }],
        anchorBeat: 0,
        anchorMidi: 60
      });

      handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

      expect(store.setPreviewNotes).toHaveBeenCalledWith([{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }]);
      expect(cursorController.set).toHaveBeenCalledWith(CursorState.Pointer);
      expect(requestRedraw).toHaveBeenCalled();
    });

    it('should early-return if clipboard is empty', () => {
      getClipboard.mockReturnValue({
        notes: [],
        anchorBeat: 0,
        anchorMidi: 60
      });

      handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

      expect(store.setPreviewNotes).not.toHaveBeenCalled();
      expect(cursorController.set).not.toHaveBeenCalled();
      expect(requestRedraw).not.toHaveBeenCalled();
    });
  });

  describe('onMouseDown', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should commit diff and transition to NoteTool when pasting', () => {
      mockFn(store.getPreviewNotes).mockReturnValue([{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }]);
      mockFn(store.isOnNonGridElement).mockReturnValue(false);

      handler.onMouseDown({ button: 0 } as MouseEvent);

      expect(recordDiff).toHaveBeenCalledWith('mockDiff', 'mockReverseDiff');
      expect(store.clearPreviewNotes).toHaveBeenCalled();
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });

    it('should early-return if not left click', () => {
      mockFn(store.isOnNonGridElement).mockReturnValue(false);
      mockFn(store.getPreviewNotes).mockReturnValue([]);  // <-- Ensure no notes to trigger recordDiff

      handler.onMouseDown({ button: 2 } as MouseEvent);

      expect(recordDiff).not.toHaveBeenCalled();
      expect(store.clearPreviewNotes).not.toHaveBeenCalled();
      expect(controller.transitionTo).not.toHaveBeenCalled();
    });

    it('should early-return if clicking outside grid', () => {
      mockFn(store.isOnNonGridElement).mockReturnValue(true);

      handler.onMouseDown({ button: 0 } as MouseEvent);

      expect(recordDiff).not.toHaveBeenCalled();
      expect(store.clearPreviewNotes).not.toHaveBeenCalled();
      expect(controller.transitionTo).not.toHaveBeenCalled();
    });

    it('should early-return if preview notes are empty', () => {
      mockFn(store.getPreviewNotes).mockReturnValue([]);
      mockFn(store.isOnNonGridElement).mockReturnValue(false);

      handler.onMouseDown({ button: 0 } as MouseEvent);

      expect(recordDiff).not.toHaveBeenCalled();
      expect(store.clearPreviewNotes).not.toHaveBeenCalled();
      expect(controller.transitionTo).not.toHaveBeenCalled();
    });
  });

  describe('onMouseLeave', () => {
    it('should clear preview notes and transition to NoteTool', () => {
      handler.onMouseLeave();

      expect(store.clearPreviewNotes).toHaveBeenCalled();
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });
  });

  describe('onExit', () => {
    it('should clear preview notes and request redraw', () => {
      handler.onExit();

      expect(store.clearPreviewNotes).toHaveBeenCalled();
      expect(requestRedraw).toHaveBeenCalled();
    });
  });
});
