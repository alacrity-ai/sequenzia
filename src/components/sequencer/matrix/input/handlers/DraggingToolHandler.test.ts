// src/components/sequencer/matrix/input/handlers/DraggingToolHandler.test.ts

// npm run test -- src/components/sequencer/matrix/input/handlers/DraggingToolHandler.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDraggingToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockDraggingToolHandler';
import { createMockAppState } from '@/appState/__mocks__/createMockAppState';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';

import * as transportService from '@/shared/playback/transportService';
vi.mock('@/shared/playback/transportService');

import * as moveNotesDiffs from '@/appState/diffEngine/types/grid/moveNotes';


import * as snappingUtils from '@/components/sequencer/matrix/utils/snapPosition.js';
import * as noteUtils from '@/shared/utils/musical/noteUtils.js';
import * as transformDraggedNotesModule from '@/components/sequencer/matrix/utils/transformDraggedNotes.js';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState';

vi.mock('@/appState/appState', () => ({
  recordDiff: vi.fn(),
  getAppState: vi.fn(() => ({
    tempo: 120,
    timeSignature: [4, 4],
    totalMeasures: 8,
    sequencers: [],
    songKey: 'CM',
    snapResolution: 1,
    noteDuration: 1,
    isTripletMode: false,
    isDottedMode: false
  })),
  getCurrentTempo: vi.fn(() => 120),
  getCurrentTimeSignature: vi.fn(() => [4, 4] as [number, number]),
  getCurrentTotalMeasures: vi.fn(() => 8),
  getCurrentSongKey: vi.fn(() => 'CM'),
  getCurrentSnapResolution: vi.fn(() => 1),
  getCurrentNoteDuration: vi.fn(() => 1),
  getCurrentIsTripletMode: vi.fn(() => false),
  getCurrentIsDottedMode: vi.fn(() => false)
}));


import { recordDiff } from '@/appState/appState';  // Will be mocked
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '@/appState/diffEngine/types/grid/moveNotes'; // Will be mocked


describe('DraggingToolHandler - onEnter Behavior', () => {
  let handler: ReturnType<typeof createMockDraggingToolHandler>['handler'];
  let store: ReturnType<typeof createMockDraggingToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockDraggingToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockDraggingToolHandler>['controller'];
  let requestRedraw: ReturnType<typeof createMockDraggingToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockDraggingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    requestRedraw = mocks.requestRedraw;
  });

  it('should transition back to NoteTool mode if no notes are selected', () => {
    vi.spyOn(store, 'getSelectedNotes').mockReturnValue([]);

    handler.onEnter();

    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
    expect(noteManager.removeAll).not.toHaveBeenCalled();
    expect(store.setPreviewNotes).not.toHaveBeenCalled();
    expect(requestRedraw).not.toHaveBeenCalled();
  });
});

describe('DraggingToolHandler - onMouseMove Behavior', () => {
  let handler: ReturnType<typeof createMockDraggingToolHandler>['handler'];
  let store: ReturnType<typeof createMockDraggingToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockDraggingToolHandler>['noteManager'];
  let grid: ReturnType<typeof createMockDraggingToolHandler>['grid'];
  let cursorController: ReturnType<typeof createMockDraggingToolHandler>['cursorController'];
  let requestRedraw: ReturnType<typeof createMockDraggingToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockDraggingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    grid = mocks.grid;
    cursorController = mocks.cursorController;
    requestRedraw = mocks.requestRedraw;

    // Setup minimal state for tests
    (handler as any).anchorNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    (handler as any).originalNotes = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
  });

  it('should early-return if snapped position is invalid', () => {
    vi.spyOn(grid, 'getSnapResolution').mockReturnValue(1);
    vi.spyOn(grid, 'isTripletMode').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedNotePosition').mockReturnValue(null);

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setPreviewNotes).not.toHaveBeenCalled();
    expect(cursorController.set).not.toHaveBeenCalled();
    expect(noteManager.previewNote).not.toHaveBeenCalled();
    expect(requestRedraw).not.toHaveBeenCalled();
  });

  it('should early-return if no anchor note is present', () => {
    (handler as any).anchorNote = null;

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setPreviewNotes).not.toHaveBeenCalled();
    expect(cursorController.set).not.toHaveBeenCalled();
    expect(noteManager.previewNote).not.toHaveBeenCalled();
    expect(requestRedraw).not.toHaveBeenCalled();
  });

  it('should update preview notes, set cursor, and trigger redraw', () => {
    vi.spyOn(grid, 'getSnapResolution').mockReturnValue(1);
    vi.spyOn(grid, 'isTripletMode').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedNotePosition').mockReturnValue({ x: 4, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('D4');
    vi.spyOn(transformDraggedNotesModule, 'transformDraggedNotes').mockReturnValue([
      { pitch: 'D4', start: 4, duration: 1, velocity: 100 }
    ]);

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setPreviewNotes).toHaveBeenCalledWith([
      { pitch: 'D4', start: 4, duration: 1, velocity: 100 }
    ]);
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.Grabbing);
    expect(noteManager.previewNote).toHaveBeenCalledWith('D4', 0.25);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should skip previewNote if pitch hasn’t changed', () => {
    vi.spyOn(grid, 'getSnapResolution').mockReturnValue(1);
    vi.spyOn(grid, 'isTripletMode').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedNotePosition').mockReturnValue({ x: 4, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4'); // Same as anchorNote.pitch
    vi.spyOn(transformDraggedNotesModule, 'transformDraggedNotes').mockReturnValue([
      { pitch: 'C4', start: 4, duration: 1, velocity: 100 }
    ]);

    (handler as any).lastPreviewedPitch = 'C4';

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(noteManager.previewNote).not.toHaveBeenCalled();  // No re-preview for same pitch
    expect(store.setPreviewNotes).toHaveBeenCalled();
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.Grabbing);
    expect(requestRedraw).toHaveBeenCalled();
  });
});

describe('DraggingToolHandler - onMouseUp Behavior', () => {
  let handler: ReturnType<typeof createMockDraggingToolHandler>['handler'];
  let store: ReturnType<typeof createMockDraggingToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockDraggingToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockDraggingToolHandler>['controller'];
  let getSequencerId: ReturnType<typeof createMockDraggingToolHandler>['getSequencerId'];

  beforeEach(() => {
    vi.resetAllMocks();

    const mocks = createMockDraggingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    getSequencerId = mocks.getSequencerId;

    (handler as any).anchorNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    (handler as any).originalNotes = [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }];
    (handler as any).hasMoved = false;
  });

  it('should early-return on right click', () => {
    handler.onMouseUp({ button: 2 } as MouseEvent);

    expect(store.clearPreviewNotes).not.toHaveBeenCalled();
    expect(store.clearSelection).not.toHaveBeenCalled();
    expect(controller.transitionTo).not.toHaveBeenCalled();
  });

  it('should early-return if no anchor note is set', () => {
    (handler as any).anchorNote = null;

    handler.onMouseUp({ button: 0 } as MouseEvent);

    expect(store.clearPreviewNotes).not.toHaveBeenCalled();
    expect(store.clearSelection).not.toHaveBeenCalled();
    expect(controller.transitionTo).not.toHaveBeenCalled();
  });

  it('should commit move diff when notes have changed', () => {
    (handler as any).hasMoved = true;

    vi.spyOn(store, 'getPreviewNotes').mockReturnValue([
      { pitch: 'D4', start: 2, duration: 1, velocity: 100 } // changed
    ]);

    const createMoveNotesDiffSpy = vi.spyOn(moveNotesDiffs, 'createMoveNotesDiff').mockReturnValue('mockDiff' as any);
    const createReverseMoveNotesDiffSpy = vi.spyOn(moveNotesDiffs, 'createReverseMoveNotesDiff').mockReturnValue('mockReverseDiff' as any);

    handler.onMouseUp({ button: 0 } as MouseEvent);

    expect(createMoveNotesDiffSpy).toHaveBeenCalledWith(getSequencerId(), [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }], [
      { pitch: 'D4', start: 2, duration: 1, velocity: 100 }
    ]);
    expect(recordDiff).toHaveBeenCalledWith('mockDiff', 'mockReverseDiff');

    expect(store.clearPreviewNotes).toHaveBeenCalled();
    expect(store.clearSelection).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
  });

  it('should restore original notes when no effective change', () => {
    (handler as any).hasMoved = true;

    vi.spyOn(store, 'getPreviewNotes').mockReturnValue([
      { pitch: 'C4', start: 0, duration: 1, velocity: 100 } // unchanged
    ]);

    // Spy but don't mock implementations here.
    const createMoveNotesDiffSpy = vi.spyOn(moveNotesDiffs, 'createMoveNotesDiff');
    const createReverseMoveNotesDiffSpy = vi.spyOn(moveNotesDiffs, 'createReverseMoveNotesDiff');

    handler.onMouseUp({ button: 0 } as MouseEvent);

    // Should restore original notes
    expect(noteManager.add).toHaveBeenCalledWith({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });

    // No diff should be recorded
    expect(createMoveNotesDiffSpy).not.toHaveBeenCalled();
    expect(createReverseMoveNotesDiffSpy).not.toHaveBeenCalled();
    expect(recordDiff).not.toHaveBeenCalled();

    expect(store.clearPreviewNotes).toHaveBeenCalled();
    expect(store.clearSelection).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
  });
});

describe('DraggingToolHandler - onMouseLeave Behavior', () => {
  let handler: ReturnType<typeof createMockDraggingToolHandler>['handler'];
  let controller: ReturnType<typeof createMockDraggingToolHandler>['controller'];

  beforeEach(() => {
    const mocks = createMockDraggingToolHandler();
    handler = mocks.handler;
    controller = mocks.controller;
  });

  it('should reset hasMoved and transition to NoteTool', () => {
    (handler as any).hasMoved = true;

    handler.onMouseLeave();

    expect((handler as any).hasMoved).toBe(false);
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
  });
});

describe('DraggingToolHandler - onExit Behavior', () => {
  let handler: ReturnType<typeof createMockDraggingToolHandler>['handler'];
  let store: ReturnType<typeof createMockDraggingToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockDraggingToolHandler>['noteManager'];
  let requestRedraw: ReturnType<typeof createMockDraggingToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockDraggingToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    requestRedraw = mocks.requestRedraw;

    (handler as any).originalNotes = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 100 }
    ];
    (handler as any).anchorNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
  });

  it('should restore original notes and rebuild index if no drag occurred', () => {
    (handler as any).hasMoved = false;

    handler.onExit();

    expect(noteManager.add).toHaveBeenCalledWith({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });
    expect(noteManager.rebuildIndex).toHaveBeenCalled();

    expect(store.clearPreviewNotes).toHaveBeenCalled();
    expect(store.clearSelection).toHaveBeenCalled();
    expect(store.setDragAnchorNoteKey).toHaveBeenCalledWith(null);

    expect((handler as any).originalNotes).toEqual([]);
    expect((handler as any).anchorNote).toBeNull();
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should not restore notes if drag occurred, but still clear state', () => {
    (handler as any).hasMoved = true;

    handler.onExit();

    expect(noteManager.add).not.toHaveBeenCalled();
    expect(noteManager.rebuildIndex).not.toHaveBeenCalled();

    expect(store.clearPreviewNotes).toHaveBeenCalled();
    expect(store.clearSelection).toHaveBeenCalled();
    expect(store.setDragAnchorNoteKey).toHaveBeenCalledWith(null);

    expect((handler as any).originalNotes).toEqual([]);
    expect((handler as any).anchorNote).toBeNull();
    expect(requestRedraw).toHaveBeenCalled();
  });
});
