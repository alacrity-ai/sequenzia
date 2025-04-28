// setup/selectionTracker.js

import type { Grid } from '../sequencer/interfaces/Grid.js';

let activeGrid: Grid | null = null;

export function registerSelectionStart(grid: Grid): void {
  if (activeGrid && activeGrid !== grid) {
    activeGrid.clearSelection();
  }
  activeGrid = grid;
}

export function clearSelectionTracker(): void {
  activeGrid = null;
}

export function getActiveGrid(): Grid | null {
  return activeGrid;
}
