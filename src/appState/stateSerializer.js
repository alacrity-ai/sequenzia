import { getAppState } from './appState.js';

export function serializeAppState() {
  return JSON.stringify(getAppState(), null, 2);
}
