import { vi } from 'vitest';

/**
 * Factory to create mocks for appState module functions.
 * Allows spying and assertions on recordDiff and state getters.
 */
export function createMockAppState(overrides: Partial<MockAppState> = {}): MockAppState {
  const defaults: MockAppState = {
    recordDiff: vi.fn(),
    getAppState: vi.fn(() => ({
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 8,
      sequencers: [],
      songKey: 'CM',
      snapResolution: 1,
      noteDuration: 1,
      isTripletMode: false,
      isDottedMode: false
    })),
    getCurrentTempo: vi.fn(() => 120),
    getCurrentTimeSignature: vi.fn(() => [4, 4] as [number, number]),
    getCurrentTotalMeasures: vi.fn(() => 8),
    getCurrentSongKey: vi.fn(() => 'CM'),
    getCurrentSnapResolution: vi.fn(() => 1),
    getCurrentNoteDuration: vi.fn(() => 1),
    getCurrentIsTripletMode: vi.fn(() => false),
    getCurrentIsDottedMode: vi.fn(() => false)
  };

  return { ...defaults, ...overrides };
}

type MockAppState = {
  recordDiff: ReturnType<typeof vi.fn>;
  getAppState: ReturnType<typeof vi.fn>;
  getCurrentTempo: ReturnType<typeof vi.fn>;
  getCurrentTimeSignature: ReturnType<typeof vi.fn>;
  getCurrentTotalMeasures: ReturnType<typeof vi.fn>;
  getCurrentSongKey: ReturnType<typeof vi.fn>;
  getCurrentSnapResolution: ReturnType<typeof vi.fn>;
  getCurrentNoteDuration: ReturnType<typeof vi.fn>;
  getCurrentIsTripletMode: ReturnType<typeof vi.fn>;
  getCurrentIsDottedMode: ReturnType<typeof vi.fn>;
};
