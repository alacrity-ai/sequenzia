// src/components/sequencer/matrix/input/handlers/__mocks__/createMockExpressSelectedIdleToolHandler.ts

import { ExpressSelectedIdleToolHandler } from '@/components/sequencer/matrix/input/handlers/ExpressSelectedIdleToolHandler';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockNoteManager } from '@/components/sequencer/matrix/__mocks__/createMockNoteManager';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockCursorController } from '@/components/sequencer/matrix/__mocks__/createMockCursorController';
import { createMockClipboard } from '@/components/sequencer/__mocks__/createMockClipboard';

import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked ExpressSelectedIdleToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockExpressSelectedIdleToolHandler() {
  const canvas = document.createElement('canvas');

  const config = createMockGridConfig();
  const scroll = createMockGridScroll();
  const noteManager = createMockNoteManager();
  const store = createMockInteractionStore();
  const grid = createMockGridSnappingContext();
  const controller = createMockInteractionController();
  const cursorController = createMockCursorController();

  const requestRedraw = vi.fn();
  const getSequencerId = vi.fn(() => 1);

  const setClipboard = vi.fn();
  const getClipboard = vi.fn(() => createMockClipboard());

  const handler = new ExpressSelectedIdleToolHandler(
    canvas,
    config,
    scroll,
    noteManager,
    store,
    grid,
    requestRedraw,
    getSequencerId,
    controller,
    cursorController,
    setClipboard,
    getClipboard
  );

  return {
    handler,
    config,
    scroll,
    noteManager,
    store,
    grid,
    controller,
    cursorController,
    requestRedraw,
    getSequencerId,
    setClipboard,
    getClipboard
  };
}
