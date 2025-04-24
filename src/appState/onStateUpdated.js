// src/appState/onStateUpdated.js

let listeners = new Set();

/**
 * Subscribe to state updates.
 * @param {function(state: object): void} cb 
 * @returns {function} unsubscribe function
 */
export function onStateUpdated(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Notify all listeners of a new state.
 * @param {object} newState
 */
export function notifyStateUpdated(newState) {
  for (const cb of listeners) cb(newState);
}
