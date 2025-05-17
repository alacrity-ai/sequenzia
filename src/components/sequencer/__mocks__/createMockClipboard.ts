// src/components/sequencer/__mocks__/createMockClipboard.ts

import type { Clipboard } from '@/components/sequencer/interfaces/Clipboard';
import type { Note } from '@/shared/interfaces/Note';

/**
 * Factory to create a mock Clipboard object.
 * Defaults to an empty clipboard but allows overrides.
 */
export function createMockClipboard(overrides: Partial<Clipboard> = {}): Clipboard {
  const mock: Clipboard = {
    notes: [],
    anchorBeat: 0,
    anchorMidi: 0,
    ...overrides
  };

  return mock;
}
