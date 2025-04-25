// setup/selectionTracker.js

let activeGrid = null;

export function registerSelectionStart(grid) {
  console.log(`registerSelectionStart called with grid: ${grid}`);
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
