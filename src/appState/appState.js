// src/appState/appState.js
import { applyDiff } from './diffEngine/applyDiff.js';
import { pushDiff } from './stateHistory.js';
import { notifyStateUpdated } from './onStateUpdated.js';

let currentAppState = {
  tempo: 120,
  timeSignature: [4, 4],
  totalMeasures: 8,
  sequencers: [] // Each: { id, instrument, notes: [...] }
};

export function getAppState() {
  return currentAppState;
}

export function setAppState(newState) {
  currentAppState = structuredClone(newState);
  notifyStateUpdated(currentAppState); // 🔁 sync live models
}

export function recordDiff(diff) {
  applyDiff(diff);            // updates currentAppState
  pushDiff(diff);             // track in undo/redo history
  notifyStateUpdated(currentAppState); // 🔁 trigger subscribers
}
