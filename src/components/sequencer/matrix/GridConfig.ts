// src/components/sequencer/matrix/GridConfig.ts

import type { GridConfig } from './interfaces/GridConfigTypes.js';

export const DEFAULT_GRID_CONFIG: GridConfig = {
  totalMeasures: 16,
  beatsPerMeasure: 4,

  layout: {
    labelWidthColumns: 1, // columns
    headerHeightRows: 2, // rows
    footerHeightRows: 1, // rows
    labelWidth: 80, // pixels
    headerHeight: 40, // pixels
    footerHeight: 40, // pixels
    baseCellWidth: 70,
    minCellWidth: 10,
    maxCellWidth: 200,
    verticalCellRatio: 4,
    highestMidi: 108,         // C8
    lowestMidi: 21            // A0
  },

  display: {
    showMeasureLines: true,
    showBeatLines: true,
    showHoveredCell: true,
    highlightCurrentMeasure: true
  },

  behavior: {
    zoom: 1.0,
    scrollMargin: 48,
    enableSnapping: true,
    snapDivisions: 4,
    maxZoom: 1.6,
    minZoom: 0.5
  }
};

export function createDefaultGridConfig(): GridConfig {
  return structuredClone(DEFAULT_GRID_CONFIG);
}

export function mergeGridConfig(
  target: GridConfig,
  update: Partial<GridConfig>
): GridConfig {
  return {
    ...target,
    ...update,
    layout: {
      ...target.layout,
      ...(update.layout ?? {})
    },
    display: {
      ...target.display,
      ...(update.display ?? {})
    },
    behavior: {
      ...target.behavior,
      ...(update.behavior ?? {})
    }
  };
}
