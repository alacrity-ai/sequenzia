// src/components/sequencer/matrix/input/handlers/__mocks__/createMockDraggingToolHandler.ts

import { DraggingToolHandler } from '@/components/sequencer/matrix/input/handlers/DraggingToolHandler';
import { createMockNoteManager } from '@/components/sequencer/matrix/__mocks__/createMockNoteManager';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockCursorController } from '@/components/sequencer/matrix/__mocks__/createMockCursorController';

import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked DraggingToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockDraggingToolHandler() {
  const canvas = document.createElement('canvas');

  const noteManager = createMockNoteManager();
  const scroll = createMockGridScroll();
  const config = createMockGridConfig();
  const store = createMockInteractionStore();
  const grid = createMockGridSnappingContext();
  const controller = createMockInteractionController();
  const cursorController = createMockCursorController();

  const requestRedraw = vi.fn();
  const getSequencerId = vi.fn(() => 1);

  const handler = new DraggingToolHandler(
    canvas,
    config,
    scroll,
    store,
    noteManager,
    grid,
    requestRedraw,
    controller,
    cursorController,
    getSequencerId
  );

  return {
    handler,
    noteManager,
    scroll,
    config,
    store,
    grid,
    controller,
    cursorController,
    requestRedraw,
    getSequencerId
  };
}
