// setup/pasteModeStore.js

let isPasting = false;
let onPaste = null;
let hoveredGrid = null;

export function startPasteMode(callback) {
  isPasting = true;
  onPaste = callback;
  hoveredGrid = null;
}

export function endPasteMode() {
    if (hoveredGrid) {
      hoveredGrid.gridContext.setPastePreviewNotes(null);
      hoveredGrid.scheduleRedraw();
      hoveredGrid.setCursor?.('default');
    }
  
    isPasting = false;
    onPaste = null;
    hoveredGrid = null;
  
    // 🧼 Fallback: always reset document-level cursor
    document.body.style.cursor = 'default';
}   

export function isPasteModeActive() {
  return isPasting;
}

export function handlePasteEvent(grid, e) {
  if (!isPasting || !onPaste) return;
  onPaste(grid, e);
  endPasteMode();
}

export function updatePasteHoverGrid(newGrid) {
  if (hoveredGrid && hoveredGrid !== newGrid) {
    hoveredGrid.gridContext.setPastePreviewNotes(null); // ✅ updated
    hoveredGrid.scheduleRedraw();
  }
  hoveredGrid = newGrid;
}
