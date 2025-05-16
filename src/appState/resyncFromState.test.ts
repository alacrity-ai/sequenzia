// src/appState/resyncFromState.test.ts

// npm run test -- src/appState/resyncFromState.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resyncFromState } from './resyncFromState';

import { updateTempo, updateTimeSignature, updateTotalMeasures } from '@/shared/playback/transportService.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { createSequencerController } from '@/components/sequencer/factories/sequencerControllerFactory.js';
import { drawMiniContour } from '@/components/sequencer/renderers/drawMiniContour.js';
import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';
import { syncLiveMatrixWithSerializedNotes } from '@/appState/utils/syncMatrixToSequencer.js';
import { getAppState } from '@/appState/appState.js';

import type { Mock } from 'vitest';

vi.mock('@/shared/playback/transportService.js', () => ({
  updateTempo: vi.fn(),
  updateTimeSignature: vi.fn(),
  updateTotalMeasures: vi.fn(),
}));

vi.mock('@/components/sequencer/stores/sequencerStore.js', () => ({
  getSequencers: vi.fn(),
}));

vi.mock('@/components/sequencer/factories/sequencerControllerFactory.js', () => ({
  createSequencerController: vi.fn(),
}));

vi.mock('@/components/sequencer/renderers/drawMiniContour.js', () => ({
  drawMiniContour: vi.fn(),
}));

vi.mock('@/shared/playback/helpers/drawGlobalMiniContour.js', () => ({
  drawGlobalMiniContour: vi.fn(),
}));

vi.mock('@/appState/utils/syncMatrixToSequencer.js', () => ({
  syncLiveMatrixWithSerializedNotes: vi.fn(),
}));

vi.mock('@/appState/appState.js', () => ({
  getAppState: vi.fn(),
}));

describe('resyncFromState', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    container = document.createElement('div');
    container.id = 'sequencers-container';
    document.body.appendChild(container);

    const globalMiniCanvas = document.createElement('canvas');
    globalMiniCanvas.id = 'global-mini-contour';
    document.body.appendChild(globalMiniCanvas);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('updates transport values from state', () => {
    const mockState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [],
    };

    (getAppState as Mock).mockReturnValue(mockState);
    (getSequencers as Mock).mockReturnValue([]);

    resyncFromState();

    expect(updateTempo).toHaveBeenCalledWith(120, false);
    expect(updateTimeSignature).toHaveBeenCalledWith(4, false);
    expect(updateTotalMeasures).toHaveBeenCalledWith(16, false);
  });

  it('creates new sequencer if no matching live sequencer exists', () => {
    const mockState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [
        { id: 1, instrument: 'Piano', notes: [], volume: 0.8, pan: 0, collapsed: false },
      ],
    };

    (getAppState as Mock).mockReturnValue(mockState);
    (getSequencers as Mock).mockReturnValue([]);

    resyncFromState();

    expect(createSequencerController).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ id: 1, instrument: 'Piano' })
    );
  });

  it('updates existing sequencer properties and draws mini-contour', () => {
    const liveSequencer = {
      id: 1,
      instrumentName: '',
      volume: 0,
      pan: 0,
      container: document.createElement('div'),
      config: {},
      colorIndex: 0,
      matrix: {},
      updateTotalMeasures: vi.fn(),
    };

    const miniCanvas = document.createElement('canvas');
    miniCanvas.classList.add('mini-contour');
    liveSequencer.container.appendChild(miniCanvas);

    const mockState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [
        { id: 1, instrument: 'Bass', notes: [{ start: 0, duration: 1, pitch: 'C3', velocity: 100 }], volume: 0.5, pan: -0.2, collapsed: false },
      ],
    };

    (getAppState as Mock).mockReturnValue(mockState);
    (getSequencers as Mock).mockReturnValue([liveSequencer]);

    resyncFromState();

    expect(liveSequencer.instrumentName).toBe('Bass');
    expect(liveSequencer.volume).toBe(0.5);
    expect(liveSequencer.pan).toBe(-0.2);

    expect(drawMiniContour).toHaveBeenCalledWith(
      miniCanvas,
      mockState.sequencers[0].notes,
      liveSequencer.config,
      liveSequencer.colorIndex
    );

    expect(syncLiveMatrixWithSerializedNotes).toHaveBeenCalledWith(
      liveSequencer.matrix,
      mockState.sequencers[0].notes,
      liveSequencer,
      true
    );
  });

  it('draws global mini contour if canvas is present', () => {
    const mockState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [],
    };

    (getAppState as Mock).mockReturnValue(mockState);
    (getSequencers as Mock).mockReturnValue([]);

    resyncFromState();

    expect(drawGlobalMiniContour).toHaveBeenCalled();
  });

  it('logs error if #sequencers-container is missing', () => {
    document.body.innerHTML = ''; // remove container

    const mockState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [],
    };

    (getAppState as Mock).mockReturnValue(mockState);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    resyncFromState();

    expect(consoleErrorSpy).toHaveBeenCalledWith('resyncFromState: Missing #sequencers-container');
  });
});
