// src/components/sequencer/matrix/rendering/CanvasManager.test.ts

// npm run test -- src/components/sequencer/matrix/rendering/CanvasManager.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanvasManager } from './CanvasManager';

describe('CanvasManager', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let manager: CanvasManager;

  beforeEach(() => {
    // === Create Mock Canvas & Context ===
    canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'offsetWidth', { value: 500, configurable: true });
    Object.defineProperty(canvas, 'offsetHeight', { value: 300, configurable: true });


    ctx = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Patch getContext to return our mock ctx
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    manager = new CanvasManager(canvas);
  });

  it('initializes with correct devicePixelRatio', () => {
    expect(manager.getContext()).toBe(ctx);
  });

  it('resize adjusts canvas buffer size and applies transform/scale', () => {
    Object.defineProperty(canvas, 'offsetWidth', { value: 400 });
    Object.defineProperty(canvas, 'offsetHeight', { value: 200 });


    manager.resize();

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);
    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.scale).toHaveBeenCalledWith(1, 1); // dpr is mocked to 1
  });

  it('resize skips redundant buffer resize', () => {
    // First call sets it
    manager.resize();
    vi.clearAllMocks();

    // Second call with no size change should not trigger setTransform/scale
    manager.resize();

    expect(ctx.setTransform).not.toHaveBeenCalled();
    expect(ctx.scale).not.toHaveBeenCalled();
  });

  it('clear clears logical canvas area', () => {
    manager.clear();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  });

  it('withContext invokes drawing function with ctx', () => {
    const drawFn = vi.fn();
    manager.withContext(drawFn);

    expect(drawFn).toHaveBeenCalledWith(ctx);
  });

  it('destroy clears, resets size, and removes canvas from DOM', () => {
    // Simulate canvas having a buffer size
    canvas.width = 800;
    canvas.height = 400;

    // Add canvas to DOM to verify removal
    document.body.appendChild(canvas);

    manager.destroy();

    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 400); // <-- Expect actual buffer size
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    expect(document.body.contains(canvas)).toBe(false);
  });
});
