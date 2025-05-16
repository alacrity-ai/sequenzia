// src/components/sequencer/matrix/input/handlers/__mocks__/createMockExpressNoteToolHandler.ts

import { ExpressNoteToolHandler } from '@/components/sequencer/matrix/input/handlers/ExpressNoteToolHandler';
import { createMockNoteManager } from '@/components/sequencer/matrix/__mocks__/createMockNoteManager';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockGridConfig } from '@/components/sequencer/matrix/__mocks__/createMockGridConfig';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';
import { createMockGridSnappingContext } from '@/components/sequencer/matrix/__mocks__/createMockGridSnappingContext';
import { createMockInteractionController } from '@/components/sequencer/matrix/__mocks__/createMockInteractionController';
import { createMockCursorController } from '@/components/sequencer/matrix/__mocks__/createMockCursorController';

import type { Note } from '@/shared/interfaces/Note';
import { vi } from 'vitest';

/**
 * Factory to create a fully-mocked ExpressNoteToolHandler instance for unit testing.
 * Returns handler and key mocks for assertions.
 */
export function createMockExpressNoteToolHandler() {
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
  const getClipboard = vi.fn(() => ({ notes: [] as Note[] }));
  const playNoteAnimation = vi.fn();

  const handler = new ExpressNoteToolHandler(
    canvas,
    noteManager,
    scroll,
    config,
    store,
    grid,
    requestRedraw,
    getSequencerId,
    controller,
    cursorController,
    getClipboard,
    playNoteAnimation
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
    getSequencerId,
    getClipboard,
    playNoteAnimation
  };
}
