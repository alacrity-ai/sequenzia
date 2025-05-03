// src/sequencer/matrix/utils/gridPosition.ts

import type { GridCell } from '../interfaces/GridCell.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

export function getRelativeMousePos(e: MouseEvent, canvas: HTMLElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

export function getGridCellAt(
  mouse: { x: number; y: number },
  scroll: GridScroll,
  config: GridConfig
): GridCell | null {
  const {
    layout: { labelWidth, headerHeight, baseCellWidth, verticalCellRatio, totalRows },
    totalMeasures,
    beatsPerMeasure,
    behavior: { zoom }
  } = config;

  const cellWidth = baseCellWidth * zoom;
  const cellHeight = cellWidth / verticalCellRatio;

  const totalBeats = totalMeasures * beatsPerMeasure;

  const scrollX = scroll.getX();
  const scrollY = scroll.getY();

  const gridX = Math.floor((mouse.x + scrollX - labelWidth) / cellWidth);
  const gridY = Math.floor((mouse.y + scrollY) / cellHeight);

  if (
    gridX < 0 || gridX >= totalBeats ||
    gridY < 0 || gridY >= totalRows
  ) {
    return null;
  }

  return { x: gridX, y: gridY };
}
