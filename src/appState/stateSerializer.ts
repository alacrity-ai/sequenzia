// src/appState/stateSerializer.ts

import { getAppState } from './appState.js';

/**
 * Serializes the current AppState to a formatted JSON string.
 * @returns JSON string representing the current app state
 */
export function serializeAppState(): string {
  return JSON.stringify(getAppState(), null, 2);
}
