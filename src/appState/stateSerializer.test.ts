import { describe, it, expect, vi } from 'vitest';
import { serializeAppState } from './stateSerializer';
import { getAppState } from './appState';
import type { AppState } from './interfaces/AppState';

vi.mock('./appState', () => ({
  getAppState: vi.fn()
}));

describe('serializeAppState', () => {
  it('returns a formatted JSON string of the current app state', () => {
    const mockState: AppState = {
      tempo: 100,
      timeSignature: [3, 4],
      totalMeasures: 8,
      sequencers: [
        {
          id: 2,
          instrument: 'violin',
          notes: [],
          volume: 0.6,
          pan: -0.2
        }
      ]
    };

    (getAppState as vi.Mock).mockReturnValue(mockState);

    const result = serializeAppState();
    const expected = JSON.stringify(mockState, null, 2);

    expect(result).toBe(expected);
  });
});
