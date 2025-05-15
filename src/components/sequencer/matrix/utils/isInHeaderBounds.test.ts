// src/components/sequencer/matrix/utils/isInHeaderBounds.test.ts

// npm run test -- src/components/sequencer/matrix/utils/isInHeaderBounds.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isInHeaderBounds } from './isInHeaderBounds.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

describe('isInHeaderBounds', () => {
  const mockCanvas = document.createElement('div');
  const mockRect = { top: 50, left: 0, width: 100, height: 200 } as DOMRect;

  const config = {
    layout: { headerHeight: 40 } as GridConfig['layout'],
  } as GridConfig;

  beforeEach(() => {
    vi.spyOn(mockCanvas, 'getBoundingClientRect').mockReturnValue(mockRect);
  });

  it('should return true when inside header bounds (middle)', () => {
    const event = { clientY: 70 } as MouseEvent; // 70 - 50 = 20 (within 0..40)
    expect(isInHeaderBounds(event, mockCanvas, config)).toBe(true);
  });

  it('should return true when on top edge (y == 0)', () => {
    const event = { clientY: 50 } as MouseEvent; // 50 - 50 = 0
    expect(isInHeaderBounds(event, mockCanvas, config)).toBe(true);
  });

  it('should return true when on bottom edge (y == headerHeight)', () => {
    const event = { clientY: 90 } as MouseEvent; // 90 - 50 = 40
    expect(isInHeaderBounds(event, mockCanvas, config)).toBe(true);
  });

  it('should return false when above header (y < 0)', () => {
    const event = { clientY: 45 } as MouseEvent; // 45 - 50 = -5
    expect(isInHeaderBounds(event, mockCanvas, config)).toBe(false);
  });

  it('should return false when below header (y > headerHeight)', () => {
    const event = { clientY: 100 } as MouseEvent; // 100 - 50 = 50
    expect(isInHeaderBounds(event, mockCanvas, config)).toBe(false);
  });
});
