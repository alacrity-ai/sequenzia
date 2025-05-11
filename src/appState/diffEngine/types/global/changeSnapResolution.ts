import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';

/**
 * Applies a CHANGE_SNAP_RESOLUTION diff to update the snap resolution in the state.
 */
export function applyCHANGE_SNAP_RESOLUTION(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  newState.snapResolution = diff.snapResolution;
  return newState;
}

/**
 * Creates a forward diff to change the snap resolution.
 */
export function createChangeSnapResolutionDiff(snapResolution: number): Diff {
  return { type: 'CHANGE_SNAP_RESOLUTION', snapResolution };
}

/**
 * Creates a reverse diff to restore the prior snap resolution.
 */
export function createReverseChangeSnapResolutionDiff(snapResolution: number): Diff {
  return createChangeSnapResolutionDiff(snapResolution);
}
