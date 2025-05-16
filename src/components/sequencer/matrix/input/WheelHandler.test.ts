// src/sequencer/matrix/input/WheelHandler.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WheelHandler } from './WheelHandler';

describe('WheelHandler', () => {
  let canvas: HTMLDivElement;
  let mockScroll: any;
  let redraw: ReturnType<typeof vi.fn>;
  let handler: WheelHandler;

  beforeEach(() => {
    canvas = document.createElement('div');
    document.body.appendChild(canvas);

    mockScroll = {
      getX: vi.fn(() => 100),
      getY: vi.fn(() => 50),
      setScroll: vi.fn(),
    };

    redraw = vi.fn();
    handler = new WheelHandler(canvas, mockScroll, redraw, vi.fn(), vi.fn());
  });

  afterEach(() => {
    handler.destroy();
    canvas.remove();
  });

  it('scrolls vertically by default and calls requestRedraw', () => {
    const wheelEvent = new WheelEvent('wheel', { deltaY: 20 });
    canvas.dispatchEvent(wheelEvent);

    expect(mockScroll.setScroll).toHaveBeenCalledWith(100, 70);
    expect(redraw).toHaveBeenCalled();
  });

  it('scrolls horizontally when shiftKey is pressed', () => {
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 15,
      shiftKey: true,
    });
    canvas.dispatchEvent(wheelEvent);

    expect(mockScroll.setScroll).toHaveBeenCalledWith(115, 50);
  });

  it('scrolls horizontally when deltaX > deltaY', () => {
    const wheelEvent = new WheelEvent('wheel', {
      deltaX: 30,
      deltaY: 10,
    });
    canvas.dispatchEvent(wheelEvent);

    expect(mockScroll.setScroll).toHaveBeenCalledWith(130, 50);
  });

  it('removes event listener on destroy', () => {
    handler.destroy();
    const spy = vi.spyOn(mockScroll, 'setScroll');
    const wheelEvent = new WheelEvent('wheel', { deltaY: 20 });
    canvas.dispatchEvent(wheelEvent);

    expect(spy).not.toHaveBeenCalled();
  });
});
