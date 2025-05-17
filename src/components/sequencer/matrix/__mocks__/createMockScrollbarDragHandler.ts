import type { ScrollbarDragHandler } from '@/components/sequencer/matrix/scrollbars/ScrollbarDragHandler';
import { vi } from 'vitest';

/**
 * Factory function to create a mock ScrollbarDragHandler instance.
 * Useful for testing modules that depend on the handler, without actual DOM drag events.
 */
export function createMockScrollbarDragHandler(): ScrollbarDragHandler {
  const mock = {
    destroy: vi.fn(),
  } as unknown as ScrollbarDragHandler;

  return mock;
}
