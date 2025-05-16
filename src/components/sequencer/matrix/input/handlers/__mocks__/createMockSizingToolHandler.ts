// src/components/sequencer/matrix/input/handlers/__mocks__/createMockSizingToolHandler.ts

import { SizingToolHandler } from '@/components/sequencer/matrix/input/handlers/SizingToolHandler';
import { createMockNoteManager } from '@/components/sequencer/matrix/__mocks__/createMockNoteManager';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockCursorController } from '@/components/sequencer/matrix/__mocks__/createMockCursorController';

import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked SizingToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockSizingToolHandler() {
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

  const handler = new SizingToolHandler(
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
