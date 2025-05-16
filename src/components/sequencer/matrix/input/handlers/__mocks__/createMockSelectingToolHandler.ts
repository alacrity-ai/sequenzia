// src/components/sequencer/matrix/input/handlers/__mocks__/createMockSelectingToolHandler.ts

import { SelectingToolHandler } from '@/components/sequencer/matrix/input/handlers/SelectingToolHandler';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockNoteManager } from '@/components/sequencer/matrix/__mocks__/createMockNoteManager';

import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked SelectingToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockSelectingToolHandler() {
  const canvas = document.createElement('canvas');

  const config = createMockGridConfig();
  const scroll = createMockGridScroll();
  const grid = createMockGridSnappingContext();
  const store = createMockInteractionStore();
  const controller = createMockInteractionController();
  const noteManager = createMockNoteManager();

  const requestRedraw = vi.fn();

  const handler = new SelectingToolHandler(
    canvas,
    config,
    scroll,
    grid,
    store,
    controller,
    noteManager,
    requestRedraw
  );

  return {
    handler,
    config,
    scroll,
    grid,
    store,
    controller,
    noteManager,
    requestRedraw
  };
}
