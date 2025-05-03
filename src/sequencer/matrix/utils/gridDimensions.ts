// src/sequencer/matrix/utils/gridDimensions.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';

/**
 * Returns the total content width in pixels (scrollable + label).
 */
export function getContentWidth(config: GridConfig): number {
  const {
    layout: { labelWidth, baseCellWidth },
    totalMeasures,
    beatsPerMeasure,
    behavior: { zoom }
  } = config;

  return labelWidth + totalMeasures * beatsPerMeasure * baseCellWidth * zoom;
}

/**
 * Returns the total content height in pixels (scrollable + header).
 */
export function getContentHeight(config: GridConfig): number {
  const {
    layout: { baseCellWidth, verticalCellRatio },
    layout: { totalRows = 88 }, // default if not explicitly set
    behavior: { zoom }
  } = config;

  return totalRows * (baseCellWidth * zoom) / verticalCellRatio;
}
