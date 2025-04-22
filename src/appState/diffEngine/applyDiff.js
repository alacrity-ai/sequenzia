import { getAppState, setAppState } from '../appState.js';
import * as diffTypes from './types/allDiffs.js'; // Combines all exported apply* methods

export function applyDiff(diff) {
  const handler = diffTypes[`apply${diff.type}`];
  if (!handler) throw new Error(`Unknown diff type: ${diff.type}`);
  const newState = handler(getAppState(), diff);
  setAppState(newState);
}
