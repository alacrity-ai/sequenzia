// src/components/sequencer/matrix/input/handlers/ExpressSelectedIdleToolHandler.test.ts

// npm run test -- src/components/sequencer/matrix/input/handlers/ExpressSelectedIdleToolHandler.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockExpressSelectedIdleToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockExpressSelectedIdleToolHandler';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';
import * as snappingUtils from '@/components/sequencer/matrix/utils/snapping';
import * as noteUtils from '@/shared/utils/musical/noteUtils';
import * as snapPositionUtils from '@/components/sequencer/matrix/utils/snapPosition';

import { getRawBeatFromEvent } from '@/components/sequencer/matrix/utils/snapping';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState';

import type { MockInstance } from 'vitest';

vi.mock('@/components/sequencer/matrix/utils/snapping', async () => {
  const actual = await vi.importActual<typeof snappingUtils>('@/components/sequencer/matrix/utils/snapping');
  return {
    ...actual,
    getSnappedFromEvent: vi.fn(),
    getRawBeatFromEvent: vi.fn(),
  };
});

vi.mock('@/shared/utils/musical/noteUtils', async () => {
  const actual = await vi.importActual<typeof noteUtils>('@/shared/utils/musical/noteUtils');
  return {
    ...actual,
    rowToNote: vi.fn()
  };
});

const mockFn = <T extends (...args: any[]) => any>(
  fn: T
): MockInstance<T> => fn as unknown as MockInstance<T>;

describe('ExpressSelectedIdleToolHandler - onEnter & onExit', () => {
  let handler: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['store'];
  let requestRedraw: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockExpressSelectedIdleToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    requestRedraw = mocks.requestRedraw;
  });

  it('should begin selection drag if left mouse button is held on enter', () => {
    const fakeMouseEvent = { buttons: 1, clientX: 100, clientY: 200 } as MouseEvent;
    (window as any).event = fakeMouseEvent;

    handler.onEnter();

    expect(store.beginSelectionDrag).toHaveBeenCalled();
  });

  it('should reset hover and snapped state on exit', () => {
    handler.onExit();

    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(requestRedraw).toHaveBeenCalled();
  });
});

describe('ExpressSelectedIdleToolHandler - onMouseDown', () => {
  let handler: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['controller'];

  beforeEach(() => {
    const mocks = createMockExpressSelectedIdleToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;

    vi.resetAllMocks();
  });

  it('should early-return on non-grid elements', () => {
    vi.spyOn(store, 'isOnNonGridElement').mockReturnValue(true);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(noteManager.findNoteUnderCursor).not.toHaveBeenCalled();
    expect(controller.transitionTo).not.toHaveBeenCalled();
  });

  it('should transition to Sizing when clicking note edge', () => {
    vi.spyOn(store, 'isOnNonGridElement').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedFromEvent').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);

    const edgeNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    vi.spyOn(noteManager, 'findNoteUnderCursor').mockReturnValue(edgeNote);
    vi.spyOn(noteManager, 'findNoteEdgeAtCursor').mockReturnValue(edgeNote);

    mockFn(store.getSelectedNotes).mockReturnValue([]);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(store.setSelectedNotes).toHaveBeenCalledWith([edgeNote]);
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Sizing);
  });

  it('should begin drag when clicking selected note', () => {
    vi.spyOn(store, 'isOnNonGridElement').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedFromEvent').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);

    const hoveredNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    vi.spyOn(noteManager, 'findNoteUnderCursor').mockReturnValue(hoveredNote);
    vi.spyOn(noteManager, 'findNoteEdgeAtCursor').mockReturnValue(undefined);

    handler.onMouseDown({ button: 0, clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.beginSelectionDrag).toHaveBeenCalled();
  });

  it('should set hovered key on right-click of note', () => {
    vi.spyOn(store, 'isOnNonGridElement').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedFromEvent').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);

    const hoveredNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    vi.spyOn(noteManager, 'findNoteUnderCursor').mockReturnValue(hoveredNote);

    handler.onMouseDown({ button: 2 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith('C4:0');
  });

  it('should begin marquee drag on right-click empty space', () => {
    vi.spyOn(store, 'isOnNonGridElement').mockReturnValue(false);
    vi.spyOn(snappingUtils, 'getSnappedFromEvent').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);

    vi.spyOn(noteManager, 'findNoteUnderCursor').mockReturnValue(undefined);

    handler.onMouseDown({ button: 2, clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(store.beginSelectionDrag).toHaveBeenCalled();
  });
});

describe('ExpressSelectedIdleToolHandler - onMouseMove', () => {
  let handler: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['cursorController'];
  let requestRedraw: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['requestRedraw'];
  let grid: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['grid'];
  let scroll: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['scroll'];
  let config: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['config'];

  beforeEach(() => {
    const mocks = createMockExpressSelectedIdleToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
    requestRedraw = mocks.requestRedraw;
    grid = mocks.grid;
    scroll = mocks.scroll;
    config = mocks.config;

    vi.resetAllMocks();
    handler['initialMouseX'] = 100;
    handler['initialMouseY'] = 100;
  });

  it('should reset hover state when cursor is off-grid', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(true);

    handler.onMouseMove({ clientX: 120, clientY: 120 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.Default);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should transition to Dragging when dragging selected note beyond threshold', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.isDraggingToSelect).mockReturnValue(true);
    mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');
    mockFn(noteManager.findAtPosition).mockReturnValue({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });
    mockFn(store.getSelectedNotes).mockReturnValue([]);

    handler.onMouseMove({ clientX: 110, clientY: 110, buttons: 1 } as MouseEvent);

    expect(store.setSelectedNotes).toHaveBeenCalledWith([{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }]);
    expect(store.setDragAnchorNoteKey).toHaveBeenCalledWith('C4:0');
    expect(store.endSelectionDrag).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Dragging);
  });

  it('should transition to Selecting when right-dragging empty space', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.isDraggingToSelect).mockReturnValue(true);
    mockFn(store.getHoveredNoteKey).mockReturnValue(null);

    handler.onMouseMove({ clientX: 110, clientY: 110, buttons: 2 } as MouseEvent);

    expect(store.clearSelection).toHaveBeenCalled();
    expect(store.endSelectionDrag).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Selecting);
  });

  it('should update hover and cursor state when hovering over note edge', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(grid.getSnapResolution).mockReturnValue(1);
    mockFn(grid.isTripletMode).mockReturnValue(false);
    vi.spyOn(snapPositionUtils, 'getSnappedNotePosition').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');

    const hoveredNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(noteManager.findNoteUnderCursor).mockReturnValue(hoveredNote);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(hoveredNote);

    handler.onMouseMove({ clientX: 110, clientY: 110 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith('C4:0');
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.ResizeHorizontal);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should update hover and cursor state when hovering over note body', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(grid.getSnapResolution).mockReturnValue(1);
    mockFn(grid.isTripletMode).mockReturnValue(false);
    vi.spyOn(snapPositionUtils, 'getSnappedNotePosition').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');

    const hoveredNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(noteManager.findNoteUnderCursor).mockReturnValue(hoveredNote);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(undefined);

    handler.onMouseMove({ clientX: 110, clientY: 110 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith('C4:0');
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.Pointer);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should reset hover state when not hovering any note', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(grid.getSnapResolution).mockReturnValue(1);
    mockFn(grid.isTripletMode).mockReturnValue(false);
    vi.spyOn(snapPositionUtils, 'getSnappedNotePosition').mockReturnValue({ x: 1, y: 2 });
    vi.spyOn(snappingUtils, 'getRawBeatFromEvent').mockReturnValue(0);
    vi.spyOn(noteUtils, 'rowToNote').mockReturnValue('C4');

    mockFn(noteManager.findNoteUnderCursor).mockReturnValue(undefined);

    handler.onMouseMove({ clientX: 110, clientY: 110 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(cursorController.set).toHaveBeenCalledWith(CursorState.Default);
    expect(requestRedraw).toHaveBeenCalled();
  });
});

describe('ExpressSelectedIdleToolHandler - onMouseUp', () => {
  let handler: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['controller'];
  let requestRedraw: ReturnType<typeof createMockExpressSelectedIdleToolHandler>['requestRedraw'];

  beforeEach(() => {
    const mocks = createMockExpressSelectedIdleToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    requestRedraw = mocks.requestRedraw;

    vi.resetAllMocks();
  });

  it('should early-return on non-left-click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);

    handler.onMouseUp({ button: 2 } as MouseEvent);

    expect(store.endSelectionDrag).not.toHaveBeenCalled();
    expect(noteManager.findNoteAtMousePosition).not.toHaveBeenCalled();
  });

  it('should early-return on non-grid elements', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(true);

    handler.onMouseUp({ button: 0 } as MouseEvent);

    expect(store.endSelectionDrag).not.toHaveBeenCalled();
    expect(noteManager.findNoteAtMousePosition).not.toHaveBeenCalled();
  });

  it('should suppress mouseup if flagged', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.consumeSuppressMouseUpFlag).mockReturnValue(true);

    const e = new MouseEvent('mouseup', { button: 0 });
    vi.spyOn(e, 'stopPropagation').mockImplementation(() => {});

    handler.onMouseUp(e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(store.endSelectionDrag).not.toHaveBeenCalled();
    expect(noteManager.findNoteAtMousePosition).not.toHaveBeenCalled();
  });

  it('should toggle note selection with ctrl-click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.consumeSuppressMouseUpFlag).mockReturnValue(false);
    mockFn(noteManager.findNoteAtMousePosition).mockReturnValue({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });

    const existingNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(store.getSelectedNotes).mockReturnValue([existingNote]);

    const e = { button: 0, ctrlKey: true, metaKey: false, stopPropagation: vi.fn() } as unknown as MouseEvent;
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });

    handler.onMouseUp(e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(store.endSelectionDrag).toHaveBeenCalled();
    expect(store.setSelectedNotes).toHaveBeenCalledWith([]);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should add note to selection if not already selected with ctrl-click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.consumeSuppressMouseUpFlag).mockReturnValue(false);

    const newNote = { pitch: 'D4', start: 1, duration: 1, velocity: 100 };
    mockFn(noteManager.findNoteAtMousePosition).mockReturnValue(newNote);
    mockFn(store.getSelectedNotes).mockReturnValue([]);

    const e = { button: 0, ctrlKey: true, metaKey: false, stopPropagation: vi.fn() } as unknown as MouseEvent;
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });

    handler.onMouseUp(e);

    expect(noteManager.previewNote).toHaveBeenCalledWith('D4', 0.25);
    expect(store.setSelectedNotes).toHaveBeenCalledWith([newNote]);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should replace selection and preview note on normal left-click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.consumeSuppressMouseUpFlag).mockReturnValue(false);

    const clickedNote = { pitch: 'E4', start: 2, duration: 1, velocity: 100 };
    mockFn(noteManager.findNoteAtMousePosition).mockReturnValue(clickedNote);

    const e = { button: 0, ctrlKey: false, metaKey: false, stopPropagation: vi.fn() } as unknown as MouseEvent;
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });

    handler.onMouseUp(e);

    expect(store.setSelectedNotes).toHaveBeenCalledWith([clickedNote]);
    expect(noteManager.previewNote).toHaveBeenCalledWith('E4', 0.25);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should clear selection and return to NoteTool on empty space click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.consumeSuppressMouseUpFlag).mockReturnValue(false);
    mockFn(noteManager.findNoteAtMousePosition).mockReturnValue(undefined);

    const e = { button: 0, ctrlKey: false, metaKey: false, stopPropagation: vi.fn() } as unknown as MouseEvent;
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });

    handler.onMouseUp(e);

    expect(store.clearSelection).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.NoteTool);
  });
});
