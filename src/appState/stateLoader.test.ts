import { describe, it, expect, vi } from 'vitest';
import { loadAppStateFromJSON } from './stateLoader';
import { setAppState } from './appState';
import type { AppState } from './interfaces/AppState';

// Mock setAppState to observe its input
vi.mock('./appState', () => ({
  setAppState: vi.fn()
}));

describe('loadAppStateFromJSON', () => {
  it('parses JSON and sets app state', () => {
    const mockState: AppState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      sequencers: [
        {
          id: 1,
          instrument: 'piano',
          notes: [],
          volume: 0.8,
          pan: 0
        }
      ]
    };

    const json = JSON.stringify(mockState);
    loadAppStateFromJSON(json);

    expect(setAppState).toHaveBeenCalledWith(mockState);
  });
});
