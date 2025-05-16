// src/appState/utils/syncMatrixToSequencer.test.ts

// npm run test -- src/appState/utils/syncMatrixToSequencer.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncLiveMatrixWithSerializedNotes } from '@/appState/utils/syncMatrixToSequencer.js';
import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';

import type { Mock } from 'vitest';

vi.mock('@/shared/playback/PlaybackEngine.js', () => ({
  PlaybackEngine: {
    getInstance: vi.fn(),
  },
}));

describe('syncLiveMatrixWithSerializedNotes', () => {
  let matrix: any;
  let interactionStore: any;
  let sequencer: any;

  const serializedNotes = [
    { pitch: 'C4', start: 0, duration: 1, velocity: 100 },
    { pitch: 'E4', start: 1, duration: 1, velocity: 100 },
  ];

  beforeEach(() => {
    interactionStore = {
      getSelectedNotes: vi.fn(() => []),
      setSelectedNotes: vi.fn(),
    };

    matrix = {
      getInteractionStore: vi.fn(() => interactionStore),
      setNotes: vi.fn(),
      getNoteManager: vi.fn(() => ({ rebuildIndex: vi.fn() })),
      notes: serializedNotes,
      requestRedraw: vi.fn(),
    };

    sequencer = {
      reschedulePlayback: vi.fn().mockResolvedValue(undefined),
    };

    (PlaybackEngine.getInstance as Mock).mockReturnValue({
      isActive: vi.fn(() => false),
    });
  });

  it('sets notes and rebuilds index', () => {
    const mockNoteManager = { rebuildIndex: vi.fn() };
    matrix.getNoteManager = vi.fn(() => mockNoteManager);

    syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer);

    expect(matrix.setNotes).toHaveBeenCalledWith(serializedNotes);
    expect(mockNoteManager.rebuildIndex).toHaveBeenCalled();
  });

  it('restores selection if preserveSelection is true', () => {
    const selectedNotes = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 100 },
    ];
    interactionStore.getSelectedNotes.mockReturnValue(selectedNotes);

    syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer);

    expect(interactionStore.setSelectedNotes).toHaveBeenCalledWith(selectedNotes);
  });

  it('does not restore selection if preserveSelection is false', () => {
    const selectedNotes = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 100 },
    ];
    interactionStore.getSelectedNotes.mockReturnValue(selectedNotes);

    syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer, false);

    expect(interactionStore.setSelectedNotes).not.toHaveBeenCalled();
  });

  it('reschedules playback if playback engine is active', async () => {
    (PlaybackEngine.getInstance as Mock).mockReturnValue({
      isActive: vi.fn(() => true),
      getStartTime: vi.fn(() => 10),
      getStartBeat: vi.fn(() => 2),
    });

    await syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer);

    expect(sequencer.reschedulePlayback).toHaveBeenCalledWith(10, 2);
  });

  it('does not call reschedulePlayback if playback is inactive', async () => {
    (PlaybackEngine.getInstance as Mock).mockReturnValue({
      isActive: vi.fn(() => false),
    });

    await syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer);

    expect(sequencer.reschedulePlayback).not.toHaveBeenCalled();
  });

  it('always requests redraw after syncing', () => {
    syncLiveMatrixWithSerializedNotes(matrix, serializedNotes, sequencer);
    expect(matrix.requestRedraw).toHaveBeenCalled();
  });
});
