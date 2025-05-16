// src/components/sequencer/matrix/__mocks__/createMockGridSnappingContext.ts

import type { GridSnappingContext } from '@/components/sequencer/matrix/interfaces/GridSnappingContext';
import { vi } from 'vitest';

/**
 * Factory function to create a mock GridSnappingContext.
 * Returns controllable values for resolution, duration, and triplet mode.
 */
export function createMockGridSnappingContext(overrides: Partial<GridSnappingContext> = {}): GridSnappingContext {
  const mock: GridSnappingContext = {
    getSnapResolution: vi.fn(() => 1.0),
    getNoteDuration: vi.fn(() => 1.0),
    isTripletMode: vi.fn(() => false)
  };

  return { ...mock, ...overrides };
}
