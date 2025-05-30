// src/appState/interfaces/HistoryEntry.ts

import { Diff } from './Diff.js';

export interface HistoryEntry {
  forwardDiff: Diff;
  reverseDiff: Diff;
}
