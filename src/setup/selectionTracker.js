// setup/selectionTracker.js

let activeGrid = null;

export function registerSelectionStart(grid) {
  if (activeGrid && activeGrid !== grid) {
    activeGrid.clearSelection();
  }
  activeGrid = grid;
}

export function clearSelectionTracker() {
  activeGrid = null;
}

export function getActiveGrid() {
  return activeGrid;
}
