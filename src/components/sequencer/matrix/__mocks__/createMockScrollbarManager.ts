// src/components/sequencer/matrix/__mocks__/createMockScrollbarManager.ts

import type { ScrollbarManager } from '@/components/sequencer/matrix/scrollbars/ScrollbarManager';
import { vi } from 'vitest';

/**
 * Factory to create a mock ScrollbarManager instance.
 * Useful for dependency injection into components that consume ScrollbarManager.
 */
export function createMockScrollbarManager(): ScrollbarManager {
  const mock = {
    update: vi.fn(),
    destroy: vi.fn(),

    // Optional direct thumb/DOM mocks for tests needing structural access
    hScrollbar: document.createElement('div'),
    hThumb: document.createElement('div'),
    vScrollbar: document.createElement('div'),
    vThumb: document.createElement('div'),
    corner: document.createElement('div'),

    // Private mock internals for advanced testing if needed
    hDragHandler: { destroy: vi.fn() },
    vDragHandler: { destroy: vi.fn() },
  } as unknown as ScrollbarManager;

  return mock;
}
