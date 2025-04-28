// src/appState/appState.ts

import { applyDiff } from './diffEngine/applyDiff.js';
import { pushDiff } from './stateHistory.js';
import { notifyStateUpdated } from './onStateUpdated.js';
import { AppState } from './interfaces/AppState.js';
import { Diff } from './interfaces/Diff.js';

// Initial application state
let currentAppState: AppState = {
  tempo: 120,
  timeSignature: [4, 4],
  totalMeasures: 8,
  sequencers: [],
};

/**
 * Gets the current application state.
 */
export function getAppState(): AppState {
  return currentAppState;
}

/**
 * Sets the application state to a new value.
 * Notifies subscribers after updating.
 */
export function setAppState(newState: AppState): void {
  currentAppState = structuredClone(newState);
  notifyStateUpdated(currentAppState);
}

/**
 * Records a diff to the state history and notifies subscribers.
 */
export function recordDiff(forwardDiff: Diff, reverseDiff: Diff): void {
  applyDiff(forwardDiff);
  pushDiff({ forwardDiff, reverseDiff });
  notifyStateUpdated(currentAppState);
}
