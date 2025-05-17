// src/components/sequencer/matrix/input/handlers/ExpressNoteToolHandler.test.ts

// npm run test -- src/components/sequencer/matrix/input/handlers/ExpressNoteToolHandler.test.ts

import { describe, it, expect, vi, type MockInstance, beforeEach } from 'vitest';
import { createMockExpressNoteToolHandler } from '@/components/sequencer/matrix/input/handlers/__mocks__/createMockExpressNoteToolHandler';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';
import { matchesMacro } from '@/shared/keybindings/useKeyMacro';

import * as snappingUtils from '@/components/sequencer/matrix/utils/snapping.js';
import * as gridGuards from '@/components/sequencer/matrix/utils/gridGuards.js';
import * as appState from '@/appState/appState.js';

import type { Note } from '@/shared/interfaces/Note';

// Type-safe helper for vi.fn mocks
const mockFn = <T extends (...args: any[]) => any>(
  fn: T
): MockInstance<T> => fn as unknown as MockInstance<T>;

// === Global mocks ===
vi.mock('@/components/sequencer/matrix/utils/snapping.js', async () => {
  const actual = await vi.importActual<typeof import('@/components/sequencer/matrix/utils/snapping.js')>(
    '@/components/sequencer/matrix/utils/snapping.js'
  );
  return {
    ...actual,
    getRawBeatFromEvent: vi.fn(() => 0),
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

vi.mock('@/appState/appState.js', () => ({
  recordDiff: vi.fn()
}));

vi.mock('@/shared/keybindings/useKeyMacro.js', () => ({
  matchesMacro: vi.fn(() => false)
}));

vi.unmock('@/shared/utils/musical/noteUtils');  // Real implementation

describe('ExpressNoteToolHandler - onMouseDown Interaction Scenarios', () => {
  let handler: ReturnType<typeof createMockExpressNoteToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressNoteToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressNoteToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressNoteToolHandler>['controller'];
  let grid: ReturnType<typeof createMockExpressNoteToolHandler>['grid'];
  let playNoteAnimation: ReturnType<typeof createMockExpressNoteToolHandler>['playNoteAnimation'];

  beforeEach(() => {
    const mocks = createMockExpressNoteToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    grid = mocks.grid;
    playNoteAnimation = mocks.playNoteAnimation;

    mockFn(grid.getNoteDuration).mockReturnValue(1);
  });

  it('should do nothing when clicking on non-grid element', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(true);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(store.beginSelectionDrag).not.toHaveBeenCalled();
    expect(noteManager.previewNote).not.toHaveBeenCalled();
    expect(controller.transitionTo).not.toHaveBeenCalled();
  });

  it('should begin marquee selection on right click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);

    const e = { button: 2, clientX: 100, clientY: 200 } as MouseEvent;
    handler.onMouseDown(e);

    expect(store.beginSelectionDrag).toHaveBeenCalled();
    // internalMouseX/Y would update but can't assert directly—it's private
  });

  it('should select edge note and transition to Sizing when clicking note edge', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');

    const hoveredNote: Note = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(noteManager.findAtPosition).mockReturnValue(hoveredNote);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(hoveredNote);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(store.setSelectedNotes).toHaveBeenCalledWith([hoveredNote]);
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Sizing);
  });

  it('should preview hovered note and transition to SelectedIdle when clicking non-edge note', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');

    const hoveredNote: Note = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(noteManager.findAtPosition).mockReturnValue(hoveredNote);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(undefined);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(noteManager.previewNote).toHaveBeenCalledWith('C4', 0.25);
    expect(store.setSelectedNotes).toHaveBeenCalledWith([hoveredNote]);
    expect(store.suppressNextMouseUpEvent).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.SelectedIdle);
  });

  it('should skip placing note if snapped position is out of bounds', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue(null);

    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(true);

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(noteManager.previewNote).not.toHaveBeenCalled();
    expect(playNoteAnimation).not.toHaveBeenCalled();
  });

  it('should place a new note at snapped grid position when no hovered note', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue(null);
    mockFn(noteManager.findAtPosition).mockReturnValue(undefined);

    // Control snapped result realistically
    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 2 });
    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(false);

    handler.onMouseDown({ button: 0, clientX: 100, clientY: 200 } as MouseEvent);

    expect(store.beginSelectionDrag).toHaveBeenCalled();
    expect(noteManager.previewNote).toHaveBeenCalledWith('A#7', 1); // correct pitch for y=2
    expect(playNoteAnimation).toHaveBeenCalledWith(expect.objectContaining({ pitch: 'A#7', start: 1 }));
    expect(appState.recordDiff).toHaveBeenCalled();
  });

  it('should skip placing note if duplicate exists at snapped position', () => {
    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 2 });

    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue(null);

    // Simulate existing note found at snapped position
    mockFn(noteManager.findAtPosition).mockReturnValue({ pitch: 'C4', start: 1, duration: 1, velocity: 100 });

    handler.onMouseDown({ button: 0 } as MouseEvent);

    expect(noteManager.previewNote).not.toHaveBeenCalled();
    expect(playNoteAnimation).not.toHaveBeenCalled();
  });
});

describe('ExpressNoteToolHandler - onMouseMove Interaction Scenarios', () => {
  let handler: ReturnType<typeof createMockExpressNoteToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressNoteToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressNoteToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressNoteToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockExpressNoteToolHandler>['cursorController'];
  let scroll: ReturnType<typeof createMockExpressNoteToolHandler>['scroll']; // I added this

  beforeEach(() => {
    const mocks = createMockExpressNoteToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
    scroll = mocks.scroll; // I added this 
  });

  it('should reset cursor state when mouse is on non-grid element', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(true);

    handler.onMouseMove({ clientX: 100, clientY: 200 } as MouseEvent);

    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(cursorController.set).not.toHaveBeenCalled();  // No hover updates
  });

  it('should transition to Sizing when dragging selected note with matching snapped pitch', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.isDraggingToSelect).mockReturnValue(true);
    mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');
    mockFn(noteManager.findAtPosition).mockReturnValue({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });

    // snapped.y = 48 corresponds to C4
    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 48 });
    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(false);

    handler.onMouseDown({ button: 0, clientX: 50, clientY: 50 } as MouseEvent);

    handler.onMouseMove({ buttons: 1, clientX: 100, clientY: 104 } as MouseEvent);

    expect(store.setSelectedNotes).toHaveBeenCalledWith([{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }]);
    expect(store.endSelectionDrag).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Sizing);
  });

  it('should transition to Selecting when right-dragging beyond threshold', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.isDraggingToSelect).mockReturnValue(true);

    handler.onMouseMove({ buttons: 2, clientX: 100, clientY: 104 } as MouseEvent);  // exceeds dragThreshold

    expect(store.endSelectionDrag).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Selecting);
  });

  it('should update snapped cursor position and cursor state when hovering over note edge', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(false);
    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 48 });  // C4 row

    const hoveredNote = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    mockFn(noteManager.findNoteUnderCursor).mockReturnValue(hoveredNote);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(hoveredNote);  // same reference

    mockFn(scroll.getY).mockReturnValue(0);
    mockFn(snappingUtils.getRawBeatFromEvent).mockReturnValue(1);

    handler.onMouseMove({ buttons: 0, clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith('C4:0');
    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(cursorController.set).toHaveBeenCalledWith('ew-resize');
  });

  it('should update hovered note and cursor state when hovering regular note (non-edge)', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);

    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 2 });
    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(false);
    mockFn(noteManager.findNoteUnderCursor).mockReturnValue({ pitch: 'C4', start: 0, duration: 1, velocity: 100 });
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(undefined);

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith('C4:0');
    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(cursorController.set).toHaveBeenCalledWith('pointer');  // CursorState.Pointer
  });

  it('should update snapped cursor and default cursor when hovering empty grid', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);

    mockFn(snappingUtils.getSnappedFromEvent).mockReturnValue({ x: 1, y: 2 });
    mockFn(gridGuards.abortIfOutOfGridBounds).mockReturnValue(false);
    mockFn(noteManager.findNoteUnderCursor).mockReturnValue(undefined);
    mockFn(noteManager.findNoteEdgeAtCursor).mockReturnValue(undefined);

    handler.onMouseMove({ clientX: 100, clientY: 100 } as MouseEvent);

    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith({ x: 1, y: 2 });
    expect(cursorController.set).toHaveBeenCalledWith('default');  // CursorState.Default
  });
});

describe('ExpressNoteToolHandler - Passive Event Handlers', () => {
  let handler: ReturnType<typeof createMockExpressNoteToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressNoteToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressNoteToolHandler>['noteManager'];
  let controller: ReturnType<typeof createMockExpressNoteToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockExpressNoteToolHandler>['cursorController'];

  beforeEach(() => {
    const mocks = createMockExpressNoteToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
  });

  it('should end selection drag on mouse up', () => {
    handler.onMouseUp({} as MouseEvent);
    expect(store.endSelectionDrag).toHaveBeenCalled();
  });
});

describe('ExpressNoteToolHandler - Passive Input & Lifecycle Events', () => {
  let handler: ReturnType<typeof createMockExpressNoteToolHandler>['handler'];
  let store: ReturnType<typeof createMockExpressNoteToolHandler>['store'];
  let noteManager: ReturnType<typeof createMockExpressNoteToolHandler>['noteManager'];
  let getSequencerId: ReturnType<typeof createMockExpressNoteToolHandler>['getSequencerId'];
  let controller: ReturnType<typeof createMockExpressNoteToolHandler>['controller'];
  let cursorController: ReturnType<typeof createMockExpressNoteToolHandler>['cursorController'];
  let requestRedraw: ReturnType<typeof createMockExpressNoteToolHandler>['requestRedraw'];
  let getClipboard: ReturnType<typeof createMockExpressNoteToolHandler>['getClipboard'];

  beforeEach(() => {
    const mocks = createMockExpressNoteToolHandler();
    handler = mocks.handler;
    store = mocks.store;
    noteManager = mocks.noteManager;
    getSequencerId = mocks.getSequencerId;
    controller = mocks.controller;
    cursorController = mocks.cursorController;
    requestRedraw = mocks.requestRedraw;
    getClipboard = mocks.getClipboard;
  });

  it('should end selection drag on mouse up', () => {
    handler.onMouseUp({} as MouseEvent);
    expect(store.endSelectionDrag).toHaveBeenCalled();
  });

  it('should abort context menu if not on grid element', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(true);
    handler.onContextMenu({ preventDefault: vi.fn() } as unknown as MouseEvent);
    expect(store.setLastDeletionTime).not.toHaveBeenCalled();
  });

  it('should abort context menu if no hovered note key', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue(null);
    handler.onContextMenu({ preventDefault: vi.fn() } as unknown as MouseEvent);
    expect(store.setLastDeletionTime).not.toHaveBeenCalled();
  });

  it('should delete note on valid right-click', () => {
    mockFn(store.isOnNonGridElement).mockReturnValue(false);
    mockFn(store.getHoveredNoteKey).mockReturnValue('C4:0');
    mockFn(noteManager.findAtPosition).mockReturnValue({
      pitch: 'C4',
      start: 0,
      duration: 1,
      velocity: 100,
    });

    handler.onContextMenu({ preventDefault: vi.fn() } as unknown as MouseEvent);

    expect(appState.recordDiff).toHaveBeenCalled();
    expect(store.setLastDeletionTime).toHaveBeenCalled();
  });

  it('should clear hover state and reset cursor on mouse leave', () => {
    handler.onMouseLeave();
    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(cursorController.set).toHaveBeenCalledWith('default');
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should transition to Pasting on paste macro when clipboard has notes', () => {
    mockFn(getClipboard).mockReturnValue({ notes: [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }] });
    mockFn(store.clearSelection).mockImplementation(() => {});
    vi.mocked(matchesMacro).mockReturnValue(true);

    const event = { preventDefault: vi.fn() } as unknown as KeyboardEvent;
    handler.onKeyDown(event);

    expect(store.clearSelection).toHaveBeenCalled();
    expect(controller.transitionTo).toHaveBeenCalledWith(InteractionMode.Pasting);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should do nothing on paste macro if clipboard is empty', () => {
    mockFn(getClipboard).mockReturnValue({ notes: [] });
    vi.mocked(matchesMacro).mockReturnValue(true);

    const event = { preventDefault: vi.fn() } as unknown as KeyboardEvent;
    handler.onKeyDown(event);

    expect(controller.transitionTo).not.toHaveBeenCalled();
    expect(store.clearSelection).not.toHaveBeenCalled();
  });

  it('should clear preview and hover state on onExit', () => {
    handler.onExit();
    expect(store.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(store.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(requestRedraw).toHaveBeenCalled();
  });
});
