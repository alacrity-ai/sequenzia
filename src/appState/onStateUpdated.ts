// src/appState/onStateUpdated.ts

import { AppState } from './interfaces/AppState.js';

/**
 * Set of callback listeners to notify on state updates.
 */
const listeners = new Set<(state: AppState) => void>();

/**
 * Subscribe to state updates.
 * @param cb - Callback to invoke with updated state
 * @returns Unsubscribe function
 */
export function onStateUpdated(cb: (state: AppState) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Notify all listeners of a new state.
 * @param newState - Updated application state
 */
export function notifyStateUpdated(newState: AppState): void {
  for (const cb of listeners) {
    cb(newState);
  }
}
