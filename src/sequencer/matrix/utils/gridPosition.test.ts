import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRelativeMousePos,
  getRelativeMousePosFromXY,
  getGridRelativeMousePos,
  getGridRelativeMousePosFromXY,
  getGridCellAt
} from './gridPosition';
import { DEFAULT_GRID_CONFIG as config } from '../GridConfig';
import type { GridScroll } from '../scrollbars/GridScroll';

// Mock getBoundingClientRect
function mockCanvasRect(left: number, top: number): DOMRect {
  return {
    left,
    top,
    right: left + 1200,
    bottom: top + 800,
    width: 1200,
    height: 800,
    x: left,
    y: top,
    toJSON: () => ''
  } as DOMRect;
}

const mockScroll: GridScroll = {
  getX: () => 100,
  getY: () => 60
} as GridScroll;

describe('gridPosition utils', () => {
  let canvas: HTMLElement;

  beforeEach(() => {
    canvas = document.createElement('div');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockCanvasRect(10, 20));
  });

  it('gets relative mouse position from event', () => {
    const e = { clientX: 110, clientY: 120 } as MouseEvent;
    const pos = getRelativeMousePos(e, canvas);
    expect(pos).toEqual({ x: 100, y: 100 });
  });

  it('gets relative mouse position from XY', () => {
    const pos = getRelativeMousePosFromXY(130, 140, canvas as HTMLCanvasElement);
    expect(pos).toEqual({ x: 120, y: 120 });
  });

  it('gets grid-relative position from mouse event', () => {
    const e = { clientX: 110, clientY: 120 } as MouseEvent;
    const pos = getGridRelativeMousePos(e, canvas, mockScroll, config);
    expect(pos).toEqual({
      x: 100 + 100 - config.layout.labelWidth,
      y: 100 + 60 - config.layout.headerHeight
    });
  });

  it('gets grid-relative position from XY', () => {
    const pos = getGridRelativeMousePosFromXY(130, 140, canvas as HTMLCanvasElement, mockScroll, config);
    expect(pos).toEqual({
      x: 120 + 100 - config.layout.labelWidth,
      y: 120 + 60 - config.layout.headerHeight
    });
  });

  it('gets correct grid cell coordinates within bounds (based on DEFAULT_GRID_CONFIG)', () => {
    // Target x: 3, y: 4 (valid)
    const mouse = {
      x: 190, // ((3 * 70) - 100 + 80)
      y: 50   // ((4 * 17.5) - 60 + 40)
    };

    const cell = getGridCellAt(mouse, mockScroll, config);
    expect(cell).toEqual({ x: 3, y: 4 });
  });

  it('returns null for grid cell outside bounds', () => {
    const outOfBounds = { x: -5000, y: -1000 };
    const cell = getGridCellAt(outOfBounds, mockScroll, config);
    expect(cell).toBeNull();
  });
});
