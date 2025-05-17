// src/components/sequencer/matrix/input/handlers/SizingToolHandler.test.ts

// npm run test -- src/components/sequencer/matrix/input/handlers/SizingToolHandler.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSizingToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockSizingToolHandler';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';

import { recordDiff } from '@/appState/appState';
import { createResizeNotesDiff, createReverseResizeNotesDiff } from '@/appState/diffEngine/types/grid/resizeNotes';

import type { MockInstance } from 'vitest';

vi.mock('@/appState/appState', () => ({ recordDiff: vi.fn() }));
vi.mock('@/appState/diffEngine/types/grid/resizeNotes', () => ({
  createResizeNotesDiff: vi.fn(() => 'mockDiff'),
  createReverseResizeNotesDiff: vi.fn(() => 'mockReverseDiff')
}));

const mockFn = <T extends (...args: any[]) => any>(
  fn: T
): MockInstance<T> => fn as unknown as MockInstance<T>;

describe('SizingToolHandler - Behavior', () => {
  let handler: ReturnType<typeof createMockSizingToolHandler>['handler'];
  let store: ReturnType<typeof createMockSizingToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockSizingToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockSizingToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockSizingToolHandler>['cursorController'];
  let grid: ReturnType<typeof createMockSizingToolHandler>['grid'];
  let requestRedraw: ReturnType<typeof createMockSizingToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockSizingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
    grid = mocks.grid;
    requestRedraw = mocks.requestRedraw;

    vi.resetAllMocks();
  });

  describe('onEnter', () => {
    it('should initialize state and set cursor', () => {
      mockFn(store.getSelectedNotes).mockReturnValue([{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }]);
      mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');
      mockFn(controller.getLastMouseX).mockReturnValue(100);

      handler.onEnter();

      expect(cursorController.set).toHaveBeenCalledWith(CursorState.ResizeHorizontal);
      expect(noteManager.removeAll).toHaveBeenCalled();
      expect(store.setPreviewNotes).toHaveBeenCalled();
      expect(requestRedraw).toHaveBeenCalled();
    });

    it('should transition to NoteTool if no notes are selected', () => {
      mockFn(store.getSelectedNotes).mockReturnValue([]);
      handler.onEnter();

      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });
  });

  describe('onMouseMove', () => {
    let config: ReturnType<typeof createMockSizingToolHandler>['config'];

    beforeEach(() => {
      const mocks = createMockSizingToolHandler();
      handler = mocks.handler;
      config = mocks.config;
      store = mocks.store;
      grid = mocks.grid;
      controller = mocks.controller;
      requestRedraw = mocks.requestRedraw;

      vi.resetAllMocks();

      handler['anchorNote'] = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
      handler['originalNotes'] = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];

      mockFn(controller.getLastMouseX).mockReturnValue(100);
      mockFn(grid.getSnapResolution).mockReturnValue(1);
      mockFn(grid.isTripletMode).mockReturnValue(false);

      handler['initialMouseX'] = 100;
    });

    it('should skip if anchorNote is null', () => {
      handler['anchorNote'] = null;
      handler.onMouseMove({ clientX: 120 } as MouseEvent);

      expect(store.setPreviewNotes).not.toHaveBeenCalled();
    });

    it('should update preview notes and trigger redraw on valid drag', () => {
      handler['accumulatedDelta'] = 0;
      handler['initialMouseX'] = 100;

      // realistic config setup
      config.layout.baseCellWidth = 50;
      config.behavior.zoom = 1;

      // snapping context setup
      mockFn(grid.getSnapResolution).mockReturnValue(1);
      mockFn(grid.isTripletMode).mockReturnValue(false);

      handler.onMouseMove({ clientX: 160 } as MouseEvent);  // deltaPixels = 60 => snappedUnits = 1

      expect(store.setPreviewNotes).toHaveBeenCalled();
      expect(requestRedraw).toHaveBeenCalled();
    });

    it('should skip update if no effective delta', () => {
      handler.onMouseMove({ clientX: 100 } as MouseEvent);

      expect(store.setPreviewNotes).not.toHaveBeenCalled();
    });
  });

  describe('onMouseUp', () => {
    beforeEach(() => {
      handler['anchorNote'] = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
      handler['originalNotes'] = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
      handler['previewNotes'] = [{ pitch: 'C4', start: 0, duration: 2, velocity: 100 }];
      handler['hasResized'] = true;

      vi.resetAllMocks();
    });

    it('should commit resize diff and clear state on left click', () => {
      handler.onMouseUp({ button: 0 } as MouseEvent);

      expect(createResizeNotesDiff).toHaveBeenCalled();
      expect(createReverseResizeNotesDiff).toHaveBeenCalled();
      expect(recordDiff).toHaveBeenCalledWith('mockDiff', 'mockReverseDiff');

      expect(store.clearPreviewNotes).toHaveBeenCalled();
      expect(store.clearSelection).toHaveBeenCalled();
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });

    it('should early return on non-left click', () => {
      handler.onMouseUp({ button: 2 } as MouseEvent);

      expect(recordDiff).not.toHaveBeenCalled();
    });

    it('should early return if hasResized is false', () => {
      handler['hasResized'] = false;
      handler.onMouseUp({ button: 0 } as MouseEvent);

      expect(recordDiff).not.toHaveBeenCalled();
    });
  });

  describe('onMouseLeave', () => {
    it('should transition to NoteTool', () => {
      handler.onMouseLeave();

      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });
  });

  describe('onExit', () => {
    beforeEach(() => {
      handler['originalNotes'] = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
    });

    it('should restore notes if no resize occurred', () => {
      handler['hasResized'] = false;
      handler.onExit();

      expect(noteManager.add).toHaveBeenCalledWith({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });
      expect(noteManager.rebuildIndex).toHaveBeenCalled();
      expect(cursorController.set).toHaveBeenCalledWith(CursorState.Default);
      expect(requestRedraw).toHaveBeenCalled();
    });

    it('should skip restore if resized', () => {
      handler['hasResized'] = true;
      handler.onExit();

      expect(noteManager.add).not.toHaveBeenCalled();
      expect(noteManager.rebuildIndex).not.toHaveBeenCalled();
    });
  });
});
