// src/appState/stateLoader.ts

import { setAppState } from './appState.js';
import { AppState } from './interfaces/AppState.js';

/**
 * Loads and parses an AppState from a JSON string.
 * @param json - JSON string representing saved AppState
 */
export function loadAppStateFromJSON(json: string): void {
  const parsed = JSON.parse(json) as AppState;
  setAppState(parsed);
}
