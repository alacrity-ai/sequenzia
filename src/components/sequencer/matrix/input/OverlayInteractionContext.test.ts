// src/components/sequencer/matrix/input/OverlayInteractionContext.test.ts

// npm run test -- src/components/sequencer/matrix/input/OverlayInteractionContext.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OverlayInteractionContext } from './OverlayInteractionContext';

import type { OverlayHandler } from './interfaces/OverlayHandler.js';
import type { Mock } from 'vitest';

// Stub TransportSeekHandler implementation
vi.mock('./overlays/TransportSeekHandler', () => ({
  TransportSeekHandler: vi.fn().mockImplementation(() => ({
    onMouseMove: vi.fn().mockReturnValue(false),
    onMouseDown: vi.fn().mockReturnValue(false),
    onMouseUp: vi.fn().mockReturnValue(false),
    destroy: vi.fn(),
  })),
}));

const mockCanvas = document.createElement('canvas');
const mockScroll = { getX: vi.fn().mockReturnValue(0) } as any;
const mockGridConfig = { layout: { headerHeight: 40, baseCellWidth: 10 }, behavior: { zoom: 1 } } as any;
const mockSequencerConfig = { snapResolution: 0.25, isTripletMode: false } as any;

const mockData = {
  canvas: mockCanvas,
  scroll: mockScroll,
  config: mockGridConfig,
  sequencerConfig: mockSequencerConfig,
  requestRedraw: vi.fn(),
  getSequencerId: vi.fn().mockReturnValue(1),
};

describe('OverlayInteractionContext', () => {
  let context: OverlayInteractionContext;
  let mockHandler: OverlayHandler;

  beforeEach(() => {
    context = new OverlayInteractionContext(mockData as any);
    mockHandler = (context as any).handlers[0];
  });

  it('should dispatch to handler methods correctly', () => {
    const mockEvent = { clientX: 100, clientY: 200 } as MouseEvent;

    context.handleMouseMove(mockEvent);
    expect(mockHandler.onMouseMove).toHaveBeenCalledWith(mockEvent);

    context.handleMouseDown(mockEvent);
    expect(mockHandler.onMouseDown).toHaveBeenCalledWith(mockEvent);

    context.handleMouseUp(mockEvent);
    expect(mockHandler.onMouseUp).toHaveBeenCalledWith(mockEvent);
  });

  it('should return false if no handler consumes the event', () => {
    const result = context.handleMouseMove({ clientX: 50, clientY: 20 } as MouseEvent);
    expect(result).toBe(false);
  });

  it('should stop at first handler that consumes the event', () => {
    (mockHandler.onMouseMove as Mock).mockReturnValueOnce(true);

    const result = context.handleMouseMove({ clientX: 10, clientY: 10 } as MouseEvent);
    expect(result).toBe(true);

    // Should not call again on same event
    expect(mockHandler.onMouseMove).toHaveBeenCalledTimes(1);
  });

  it('should call destroy() on all handlers when destroyed', () => {
    context.destroy();
    expect(mockHandler.destroy).toHaveBeenCalled();
  });
});
