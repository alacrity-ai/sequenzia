import { describe, it, expect, vi } from 'vitest';
import { loadAppStateFromJSON } from './stateLoader';
import { serializeAppState } from './stateSerializer';
import type { AppState } from './interfaces/AppState';

vi.mock('./appState', () => {
  let internalState: AppState;
  return {
    setAppState: vi.fn((state: AppState) => { internalState = state }),
    getAppState: vi.fn(() => internalState)
  };
});

describe('AppState round-trip', () => {
  it('restores state exactly after JSON serialization and loading', () => {
    const original: AppState = {
      tempo: 111,
      timeSignature: [6, 8],
      totalMeasures: 12,
      songKey: 'CM',
      snapResolution: 0.25,
      noteDuration: 1,
      isTripletMode: false,
      isDottedMode: false,
      sequencers: [
        {
          id: 5,
          instrument: 'harp',
          notes: [{ start: 0, duration: 1, pitch: 'G#3', velocity: 64 }],
          volume: 0.75,
          pan: 0.1
        }
      ]
    };

    const json = JSON.stringify(original, null, 2);
    loadAppStateFromJSON(json);
    const roundTripped = serializeAppState();

    expect(roundTripped).toBe(json);
  });
});
