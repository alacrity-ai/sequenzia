// src/components/sequencer/matrix/input/InteractionContext.test.ts

// npm run test -- src/components/sequencer/matrix/input/InteractionContext.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InteractionContext } from './InteractionContext';
import { InteractionMode } from './interfaces/InteractionEnum';
import { InteractionStore } from './stores/InteractionStore';

vi.mock('@/shared/playback/transportService.js', () => ({}));
vi.mock('@/main.js', () => ({}));

// Stub all handlers up front
vi.mock('./handlers/DefaultNoteToolHandler', () => ({
  DefaultNoteToolHandler: vi.fn().mockImplementation(() => ({
    onEnter: vi.fn(),
    onExit: vi.fn(),
    onMouseDown: vi.fn(),
    onMouseMove: vi.fn(),
  })),
}));

vi.mock('./handlers/SelectingToolHandler', () => ({
  SelectingToolHandler: vi.fn().mockImplementation(() => ({
    onEnter: vi.fn(),
    onExit: vi.fn(),
    onMouseDown: vi.fn(),
  })),
}));

// Minimal test canvas
const canvas = document.createElement('canvas');

const mockStore = new InteractionStore();
// Stub methods if needed
vi.spyOn(mockStore, 'isOnNonGridElement').mockReturnValue(false);
vi.spyOn(mockStore, 'setSnappedCursorGridPosition');
vi.spyOn(mockStore, 'setHoveredNoteKey');
vi.spyOn(mockStore, 'endSelectionDrag');

const mockData = {
  canvas,
  noteManager: {} as any,
  scroll: {} as any,
  config: {
    layout: { lowestMidi: 21, highestMidi: 108 },
  } as any,
  store: mockStore,
  grid: {} as any,
  requestRedraw: vi.fn(),
  sequencerContext: { getId: () => 'seq-1' },
  cursorController: {} as any,
  getClipboard: vi.fn(),
  setClipboard: vi.fn(),
  playNoteAnimation: vi.fn(),
};

describe('InteractionContext', () => {
  let context: InteractionContext;

  beforeEach(() => {
    context = new InteractionContext(mockData as any);
  });

  it('should initialize with DefaultNoteToolHandler and call onEnter()', () => {
    expect((context as any).activeHandler?.onEnter).toBeDefined();
  });

  it('should transition to Selecting mode and call onExit/onEnter on handlers', () => {
    const prevHandler = (context as any).activeHandler;
    const onExitSpy = vi.spyOn(prevHandler!, 'onExit');

    context.transitionTo(InteractionMode.Selecting);
    expect(onExitSpy).toHaveBeenCalled();
    expect((context as any).activeHandler?.onEnter).toBeDefined();
  });

  it('should pass mouse positions to handler and store them', () => {
    const mockEvent = { clientX: 100, clientY: 200 } as MouseEvent;
    const activeHandler = (context as any).activeHandler;
    const onMouseDown = vi.spyOn(activeHandler, 'onMouseDown');

    context.handleMouseDown(mockEvent);
    expect(onMouseDown).toHaveBeenCalledWith(mockEvent);
    expect((context as any).lastMouseX).toBe(100);
    expect((context as any).lastMouseY).toBe(200);
  });

  it('should call onExit when destroyed', () => {
    const onExit = vi.spyOn((context as any).activeHandler, 'onExit');
    context.destroy();
    expect(onExit).toHaveBeenCalled();
    expect((context as any).activeHandler).toBeNull();
  });
});
