// src/appState/stateHistory.js
import { applyDiff } from './diffEngine/applyDiff.js';
import { getAppState } from './appState.js';
import { notifyStateUpdated } from './onStateUpdated.js';

const history = [];
let pointer = -1;

const MAX_HISTORY_LENGTH = 100; // 🔁 tune this based on app complexity and RAM profile


export function pushDiff({ forwardDiff, reverseDiff }) {
  history.splice(pointer + 1); // discard future history if any
  history.push({ forwardDiff, reverseDiff });
  pointer = history.length - 1;

  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift(); // remove oldest entry
    pointer--;       // shift pointer back since history[0] is gone
  }
}

export function undo() {
  if (pointer < 0) return null;

  // Scan backward to find the previous non-checkpoint diff
  for (let i = pointer; i >= 0; i--) {
    const entry = history[i];
    if (entry?.forwardDiff?.type === 'CHECKPOINT') {
      return null; // Cannot undo past a checkpoint
    }
    if (entry?.reverseDiff) {
      pointer = i - 1;
      applyDiff(entry.reverseDiff);
      notifyStateUpdated(getAppState());
      return entry.reverseDiff;
    }
  }

  return null; // Nothing to undo
}


export function redo() {
  if (pointer >= history.length - 1) return null;

  pointer++;
  const entry = history[pointer];
  if (!entry || !entry.forwardDiff) return null;

  applyDiff(entry.forwardDiff);
  notifyStateUpdated(getAppState());
  return entry.forwardDiff;
}


export function clearHistory() {
  history.length = 0;
  pointer = -1;
}
