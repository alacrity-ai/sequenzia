// src/appState/stateHistory.js
import { applyDiff } from './diffEngine/applyDiff.js';
import { getAppState } from './appState.js';
import { notifyStateUpdated } from './onStateUpdated.js';

const history = [];
let pointer = -1;

export function pushDiff(diff) {
  history.splice(pointer + 1); // drop future
  history.push(diff);
  pointer = history.length - 1;
}

export function undo() {
  if (pointer <= 0) return null;
  pointer--;
  applyDiff(history[pointer]);
  notifyStateUpdated(getAppState());
  return history[pointer];
}

export function redo() {
  if (pointer >= history.length - 1) return null;
  pointer++;
  applyDiff(history[pointer]);
  notifyStateUpdated(getAppState());
  return history[pointer];
}

export function clearHistory() {
  history.length = 0;
  pointer = -1;
}
