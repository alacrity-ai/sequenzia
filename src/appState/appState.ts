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
  songKey: 'CM',
  snapResolution: 1,
  noteDuration: 1,
  isTripletMode: false,
  isDottedMode: false
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


// Helpers

export function getCurrentTempo(): number {
  return currentAppState.tempo;
}

export function getCurrentTimeSignature(): [number, number] {
  return currentAppState.timeSignature;
}

export function getCurrentTotalMeasures(): number {
  return currentAppState.totalMeasures;
}

export function getCurrentSongKey(): string {
  return currentAppState.songKey;
}

export function getCurrentSnapResolution(): number {
  return currentAppState.snapResolution;
}

export function getCurrentNoteDuration(): number {
  return currentAppState.noteDuration;
}

export function getCurrentIsTripletMode(): boolean {
  return currentAppState.isTripletMode;
}

export function getCurrentIsDottedMode(): boolean {
  return currentAppState.isDottedMode;
}
