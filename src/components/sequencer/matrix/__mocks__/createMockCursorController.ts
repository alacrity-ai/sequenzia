// src/components/sequencer/matrix/__mocks__/createMockCursorController.ts

import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState';
import { vi } from 'vitest';

/**
 * Factory function to create a mock CursorController.
 * Tracks calls to set() but does not manipulate the DOM.
 */
export function createMockCursorController(): CursorController {
  let currentCursor: CursorState = CursorState.Default;

  const mock = {
    set: vi.fn((cursor: CursorState) => {
      currentCursor = cursor;
    }),

    reset: vi.fn(() => {
      currentCursor = CursorState.Default;
    }),

    // Optional: Expose internal cursor state for assertions
    __getCurrentCursor: () => currentCursor
  } as unknown as CursorController;

  return mock;
}
