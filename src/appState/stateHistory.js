// src/appState/stateHistory.js
import { applyDiff } from './diffEngine/applyDiff.js';
import { getAppState } from './appState.js';
import { notifyStateUpdated } from './onStateUpdated.js';

const history = [];
let pointer = -1;

export function pushDiff({ forwardDiff, reverseDiff }) {
  history.splice(pointer + 1);
  history.push({ forwardDiff, reverseDiff });
  pointer = history.length - 1;
}

export function undo() {
  if (pointer < 0) return null;

  const entry = history[pointer];
  if (!entry || !entry.reverseDiff) return null;

  pointer--;
  applyDiff(entry.reverseDiff);
  notifyStateUpdated(getAppState());
  return entry.reverseDiff;
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
