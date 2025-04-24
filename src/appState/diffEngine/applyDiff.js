// src/appState/diffEngine/applyDiff.js

import { getAppState, setAppState } from '../appState.js';
import * as diffTypes from './types/allDiffs.js';

export function applyDiff(diff) {
  const handler = diffTypes[diff.type];
  if (!handler) throw new Error(`Unknown diff type: ${diff.type}`);
  const newState = handler(getAppState(), diff);
  setAppState(newState);
}
