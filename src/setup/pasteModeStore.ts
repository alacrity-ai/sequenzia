// src/setup/pasteModeStore.js

import type { Grid } from '../sequencer/interfaces/Grid.js';

type PasteCallback = (grid: Grid, event: MouseEvent) => void;

let isPasting = false;
let onPaste: PasteCallback | null = null;
let hoveredGrid: Grid | null = null;

export function startPasteMode(callback: PasteCallback): void {
  isPasting = true;
  onPaste = callback;
  hoveredGrid = null;
}

export function endPasteMode(): void {
  if (hoveredGrid) {
    if (!hoveredGrid.gridContext.setPastePreviewNotes) return;
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

export function isPasteModeActive(): boolean {
  return isPasting;
}

export function handlePasteEvent(grid: Grid, e: MouseEvent): void {
  if (!isPasting || !onPaste) return;
  onPaste(grid, e);
  endPasteMode();
}

export function updatePasteHoverGrid(newGrid: Grid): void {
  if (hoveredGrid && hoveredGrid !== newGrid) {
    if (!hoveredGrid.gridContext.setPastePreviewNotes) return;
    hoveredGrid.gridContext.setPastePreviewNotes(null);
    hoveredGrid.scheduleRedraw();
  }
  hoveredGrid = newGrid;
}
