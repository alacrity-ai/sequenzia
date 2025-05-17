// src/components/sequencer/matrix/__mocks__/createMockGridScroll.ts

import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll';
import { vi } from 'vitest';

/**
 * Factory function to create a mock GridScroll instance.
 * Allows basic scroll position simulation for testing.
 */
export function createMockGridScroll(initialX = 0, initialY = 0): GridScroll {
  let scrollX = initialX;
  let scrollY = initialY;

  const mock = {
    getX: vi.fn(() => scrollX),
    getY: vi.fn(() => scrollY),

    setScroll: vi.fn((x: number, y: number) => {
      scrollX = x;
      scrollY = y;
    }),

    recalculateBounds: vi.fn(() => {
      // No-op stub
    }),

    getMaxScrollX: vi.fn(() => 1000),  // Can be overridden per test if needed
    getMaxScrollY: vi.fn(() => 1000),  // Likewise

    getContentWidth: vi.fn(() => 2000),  // Arbitrary default, override if relevant
    getContentHeight: vi.fn(() => 2000)  // Likewise
  } as unknown as GridScroll;

  return mock;
}
