// src/sequencer/matrix/utils/gridDimensions.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';

/**
 * Returns the total content width in pixels (scrollable + label).
 */
export function getContentWidth(config: GridConfig): number {
    const {
      layout: { labelWidth, baseCellWidth},
      totalMeasures,
      beatsPerMeasure,
      behavior: { zoom }
    } = config;
  
    const cellWidth = baseCellWidth * zoom;
  
    return labelWidth + totalMeasures * beatsPerMeasure * cellWidth;
  }
  

/**
 * Returns the total content height in pixels (scrollable + header).
 */
export function getContentHeight(config: GridConfig): number {
    const {
      layout: { baseCellWidth, verticalCellRatio, highestMidi, lowestMidi, headerHeight },
      behavior: { zoom }
    } = config;
  
    const totalRows = highestMidi - lowestMidi + 1;
    const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
  
    return totalRows * cellHeight + headerHeight;
  }
  