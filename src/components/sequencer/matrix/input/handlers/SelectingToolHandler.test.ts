// src/components/sequencer/matrix/input/handlers/SelectingToolHandler.test.ts

// npm run test -- src/components/sequencer/matrix/input/handlers/SelectingToolHandler.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSelectingToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockSelectingToolHandler';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';

import * as gridPositionUtils from '@/components/sequencer/matrix/utils/gridPosition.js';
import * as marqueeUtils from '@/components/sequencer/matrix/utils/marqueeUtils.js';

describe('SelectingToolHandler - Behavior', () => {
  let handler: ReturnType<typeof createMockSelectingToolHandler>['handler'];
  let store: ReturnType<typeof createMockSelectingToolHandler>['store'];
  let controller: ReturnType<typeof createMockSelectingToolHandler>['controller'];
  let noteManager: ReturnType<typeof createMockSelectingToolHandler>['noteManager'];
  let requestRedraw: ReturnType<typeof createMockSelectingToolHandler>['requestRedraw'];
  let scroll: ReturnType<typeof createMockSelectingToolHandler>['scroll'];
  let config: ReturnType<typeof createMockSelectingToolHandler>['config'];
  let grid: ReturnType<typeof createMockSelectingToolHandler>['grid'];

  beforeEach(() => {
    const mocks = createMockSelectingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    controller = mocks.controller;
    noteManager = mocks.noteManager;
    requestRedraw = mocks.requestRedraw;
    scroll = mocks.scroll;
    config = mocks.config;
    grid = mocks.grid;
  });

  describe('onEnter', () => {
    it('should initialize marquee box at current mouse position', () => {
      vi.spyOn(controller, 'getLastMouseX').mockReturnValue(100);
      vi.spyOn(controller, 'getLastMouseY').mockReturnValue(200);

      vi.spyOn(gridPositionUtils, 'getGridRelativeMousePosFromXY').mockReturnValue({ x: 5, y: 10 });

      handler.onEnter();

      expect(store.setMarqueeBox).toHaveBeenCalledWith({
        startX: 5,
        startY: 10,
        currentX: 5,
        currentY: 10
      });
    });
  });

  describe('onMouseMove', () => {
    it('should early-return if marqueeBox is null', () => {
      vi.spyOn(store, 'getMarqueeBox').mockReturnValue(null);

      handler.onMouseMove({ clientX: 150, clientY: 150 } as MouseEvent);

      expect(store.setMarqueeBox).not.toHaveBeenCalled();
      expect(store.setHighlightedNotes).not.toHaveBeenCalled();
      expect(requestRedraw).not.toHaveBeenCalled();
    });

    it('should update marquee box, highlighted notes, and redraw', () => {
      const existingBox = { startX: 0, startY: 0, currentX: 0, currentY: 0 };
      vi.spyOn(store, 'getMarqueeBox').mockReturnValue(existingBox);

      vi.spyOn(gridPositionUtils, 'getGridRelativeMousePos').mockReturnValue({ x: 10, y: 20 });

      const mockNotes = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
      vi.spyOn(noteManager, 'getAll').mockReturnValue(mockNotes);
      vi.spyOn(marqueeUtils, 'getNotesInMarquee').mockReturnValue(mockNotes);

      handler.onMouseMove({ clientX: 150, clientY: 150 } as MouseEvent);

      expect(store.setMarqueeBox).toHaveBeenCalledWith({
        startX: 0,
        startY: 0,
        currentX: 10,
        currentY: 20
      });

      expect(store.setHighlightedNotes).toHaveBeenCalledWith(mockNotes);
      expect(requestRedraw).toHaveBeenCalled();
    });
  });

  describe('onMouseUp', () => {
    it('should transition to NoteTool if marqueeBox is null', () => {
      vi.spyOn(store, 'getMarqueeBox').mockReturnValue(null);

      handler.onMouseUp({ button: 0, ctrlKey: false, metaKey: false } as MouseEvent);

      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });

    it('should select notes in marquee and transition to SelectedIdle', () => {
      const box = { startX: 0, startY: 0, currentX: 10, currentY: 20 };
      vi.spyOn(store, 'getMarqueeBox').mockReturnValue(box);

      const foundNotes = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
      vi.spyOn(noteManager, 'getAll').mockReturnValue(foundNotes);
      vi.spyOn(marqueeUtils, 'getNotesInMarquee').mockReturnValue(foundNotes);

      vi.spyOn(store, 'getSelectedNotes').mockReturnValue([]);
      vi.spyOn(noteManager, 'mergeSelections').mockReturnValue(foundNotes);

      Object.defineProperty(window.navigator, 'platform', {
        value: 'Win32',
        configurable: true
      });

      handler.onMouseUp({ button: 0, ctrlKey: false, metaKey: false } as MouseEvent);

      expect(store.setSelectedNotes).toHaveBeenCalledWith(foundNotes);
      expect(store.clearHighlightedNotes).toHaveBeenCalled();
      expect(store.setMarqueeBox).toHaveBeenCalledWith(null);
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.SelectedIdle);
    });

    it('should clear selection if no notes are in marquee', () => {
      const box = { startX: 0, startY: 0, currentX: 10, currentY: 20 };
      vi.spyOn(store, 'getMarqueeBox').mockReturnValue(box);

      vi.spyOn(noteManager, 'getAll').mockReturnValue([]);
      vi.spyOn(marqueeUtils, 'getNotesInMarquee').mockReturnValue([]);

      handler.onMouseUp({ button: 0, ctrlKey: false, metaKey: false } as MouseEvent);

      expect(store.clearSelection).toHaveBeenCalled();
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });
  });

  describe('onMouseLeave', () => {
    it('should clear highlights and transition to NoteTool', () => {
      handler.onMouseLeave();

      expect(store.clearHighlightedNotes).toHaveBeenCalled();
      expect(store.setMarqueeBox).toHaveBeenCalledWith(null);
      expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    });
  });

  describe('onExit', () => {
    it('should clear highlights and trigger redraw', () => {
      handler.onExit();

      expect(store.clearHighlightedNotes).toHaveBeenCalled();
      expect(store.setMarqueeBox).toHaveBeenCalledWith(null);
      expect(requestRedraw).toHaveBeenCalled();
    });
  });
});
