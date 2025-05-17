// src/components/sequencer/matrix/__mocks__/createMockInteractionController.ts

import type { InteractionController } from '@/components/sequencer/matrix/input/interfaces/InteractionController';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum';
import { vi } from 'vitest';

/**
 * Factory function to create a mock InteractionController.
 * transitionTo is spy-able, lastMouseX/Y are configurable.
 */
export function createMockInteractionController(
  initialMouseX = 0,
  initialMouseY = 0
): InteractionController {
  let lastMouseX = initialMouseX;
  let lastMouseY = initialMouseY;

  const controller: InteractionController = {
    transitionTo: vi.fn((mode: InteractionMode) => {
      // transitionTo is tracked by vi.fn, no-op otherwise
    }),
    getLastMouseX: vi.fn(() => lastMouseX),
    getLastMouseY: vi.fn(() => lastMouseY)
  };

  // Utility setters to simulate mouse movements during tests
  (controller as any).__setMousePosition = (x: number, y: number) => {
    lastMouseX = x;
    lastMouseY = y;
  };

  return controller;
}
