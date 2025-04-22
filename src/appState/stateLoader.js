import { setAppState } from './appState.js';

export function loadAppStateFromJSON(json) {
  const parsed = JSON.parse(json);
  setAppState(parsed);
}
