// src/appState/diffEngine/applyDiff.ts

import { getAppState, setAppState } from '../appState.js';
import { AppState } from '../interfaces/AppState.js';
import { Diff } from '../interfaces/Diff.js';
import * as diffTypes from './types/allDiffs.js';

/**
 * Applies a given diff to the application state.
 * 
 * @param diff - The diff to apply.
 * @throws Error if the diff type is unknown.
 */
export function applyDiff(diff: Diff): void {
  const handler = (diffTypes as any)[diff.type] as ((state: AppState, diff: Diff) => AppState) | undefined;
  
  if (!handler) {
    throw new Error(`Unknown diff type: ${diff.type}`);
  }

  const newState: AppState = handler(getAppState(), diff);
  setAppState(newState);
}
