// src/appState/stateHistory.ts

import { applyDiff } from './diffEngine/applyDiff.js';
import { getAppState } from './appState.js';
import { notifyStateUpdated } from './onStateUpdated.js';
import { Diff } from './interfaces/Diff.js';
import { HistoryEntry } from './interfaces/HistoryEntry.js';

const history: HistoryEntry[] = [];
let pointer = -1;

const MAX_HISTORY_LENGTH = 100; // Tune this based on app complexity and RAM profile

/**
 * Push a new diff onto the history stack.
 * Discards any "future" history if needed.
 */
export function pushDiff({ forwardDiff, reverseDiff }: HistoryEntry): void {
  history.splice(pointer + 1); // discard future history if any
  history.push({ forwardDiff, reverseDiff });
  pointer = history.length - 1;

  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift(); // remove oldest entry
    pointer--;       // shift pointer back since history[0] is gone
  }
}

/**
 * Undo the last reversible action.
 */
export function undo(): Diff | null {
  if (pointer < 0) return null;

  for (let i = pointer; i >= 0; i--) {
    const entry = history[i];
    if (entry?.forwardDiff?.type === 'CHECKPOINT') {
      return null; // Cannot undo past a checkpoint
    }
    if (entry?.reverseDiff) {
      pointer = i - 1;
      applyDiff(entry.reverseDiff);
      notifyStateUpdated(getAppState());
      return entry.reverseDiff;
    }
  }

  return null;
}

/**
 * Redo the next action in history.
 */
export function redo(): Diff | null {
  if (pointer >= history.length - 1) return null;

  pointer++;
  const entry = history[pointer];
  if (!entry || !entry.forwardDiff) return null;

  applyDiff(entry.forwardDiff);
  notifyStateUpdated(getAppState());
  return entry.forwardDiff;
}

/**
 * Clear the undo/redo history.
 */
export function clearHistory(): void {
  history.length = 0;
  pointer = -1;
}

// Optional test-only exports (safe to tree-shake in production)
export const __test__ = {
  getHistory: (): HistoryEntry[] => history,
  getPointer: (): number => pointer,
  injectEntryAt: (index: number, entry: Partial<HistoryEntry>) => {
    if (history[index]) {
      Object.assign(history[index], entry);
    }
  },
  resetPointer: (value: number) => {
    pointer = value;
  }
};
