import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAppState,
  setAppState,
  recordDiff
} from './appState';
import { applyDiff } from './diffEngine/applyDiff';
import { pushDiff } from './stateHistory';
import { notifyStateUpdated } from './onStateUpdated';
import type { AppState } from './interfaces/AppState';
import type { Diff } from './interfaces/Diff';

vi.mock('./diffEngine/applyDiff', () => ({
  applyDiff: vi.fn()
}));

vi.mock('./stateHistory', () => ({
  pushDiff: vi.fn()
}));

vi.mock('./onStateUpdated', () => ({
  notifyStateUpdated: vi.fn()
}));

describe('appState', () => {
  const initial: AppState = {
    tempo: 120,
    timeSignature: [4, 4],
    totalMeasures: 8,
    snapResolution: 0.25,
    noteDuration: 1,
    sequencers: [],
    isTripletMode: false,
    isDottedMode: false,
    songKey: 'CM'
  };

  beforeEach(() => {
    setAppState(initial); // reset state each test
    vi.clearAllMocks();
  });

  it('returns the current app state via getAppState', () => {
    const result = getAppState();
    expect(result).toEqual(initial);
  });

  it('sets a new app state via setAppState and notifies subscribers', () => {
    const newState: AppState = {
      tempo: 90,
      timeSignature: [6, 8],
      totalMeasures: 12,
      songKey: 'GM',
      snapResolution: 0.5,
      noteDuration: 0.5,
      isTripletMode: false,
      isDottedMode: false,
      sequencers: [
        {
          id: 1,
          instrument: 'synth',
          notes: [],
          volume: 0.5,
          pan: 0
        }
      ]
    };

    setAppState(newState);

    expect(getAppState()).toEqual(newState);
    expect(notifyStateUpdated).toHaveBeenCalledWith(newState);
  });

  it('records a diff and routes it to applyDiff, pushDiff, and notifyStateUpdated', () => {
    const fwd: Diff = { type: 'TEST_FORWARD', value: 1 };
    const rev: Diff = { type: 'TEST_REVERSE', value: -1 };

    recordDiff(fwd, rev);

    expect(applyDiff).toHaveBeenCalledWith(fwd);
    expect(pushDiff).toHaveBeenCalledWith({ forwardDiff: fwd, reverseDiff: rev });
    expect(notifyStateUpdated).toHaveBeenCalledWith(getAppState());
  });

  it('clones the state deeply in setAppState to avoid shared references', () => {
    const newState: AppState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 16,
      songKey: 'CM',
      snapResolution: 0.25,
      noteDuration: 1,
      isTripletMode: false,
      isDottedMode: false,
      sequencers: [{ id: 1, instrument: 'piano', notes: [] }]
    };
  
    setAppState(newState);
    const returned = getAppState();
  
    expect(returned).toEqual(newState);
    expect(returned).not.toBe(newState); // top-level object cloned
    expect(returned.sequencers[0]).not.toBe(newState.sequencers[0]); // nested array cloned
  });
  
  it('still calls notifyStateUpdated when setting the same state', () => {
    const state = getAppState();
    setAppState(state); // same data (different instance)
  
    expect(notifyStateUpdated).toHaveBeenCalledWith(state);
  });

  it('recordDiff behaves gracefully if reverseDiff is undefined', () => {
    const forwardOnly: Diff = { type: 'FWD_ONLY' };
  
    recordDiff(forwardOnly, undefined as unknown as Diff);
  
    expect(applyDiff).toHaveBeenCalledWith(forwardOnly);
    expect(pushDiff).toHaveBeenCalledWith({
      forwardDiff: forwardOnly,
      reverseDiff: undefined
    });
  });  
});
