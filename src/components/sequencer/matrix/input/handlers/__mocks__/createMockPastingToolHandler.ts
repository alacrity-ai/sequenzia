// src/components/sequencer/matrix/input/handlers/__mocks__/createMockPastingToolHandler.ts

import { PastingToolHandler } from '@/components/sequencer/matrix/input/handlers/PastingToolHandler';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockCursorController } from '@/components/sequencer/matrix/__mocks__/createMockCursorController';
import { createMockClipboard } from '@/components/sequencer/__mocks__/createMockClipboard';

import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked PastingToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockPastingToolHandler() {
  const canvas = document.createElement('canvas');

  const scroll = createMockGridScroll();
  const config = createMockGridConfig();
  const store = createMockInteractionStore();
  const grid = createMockGridSnappingContext();
  const controller = createMockInteractionController();
  const cursorController = createMockCursorController();

  const requestRedraw = vi.fn();
  const getSequencerId = vi.fn(() => 1);
  const getClipboard = vi.fn(() => createMockClipboard());

  const handler = new PastingToolHandler(
    canvas,
    config,
    scroll,
    store,
    grid,
    requestRedraw,
    getSequencerId,
    controller,
    cursorController,
    getClipboard
  );

  return {
    handler,
    scroll,
    config,
    store,
    grid,
    controller,
    cursorController,
    requestRedraw,
    getSequencerId,
    getClipboard
  };
}
