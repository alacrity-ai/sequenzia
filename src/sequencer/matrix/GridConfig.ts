// src/sequencer/matrix/GridConfig.ts

import type { GridConfig } from './interfaces/GridConfigTypes.js';

export const DEFAULT_GRID_CONFIG: GridConfig = {
  totalMeasures: 16,
  beatsPerMeasure: 4,

  layout: {
    labelWidth: 60,
    headerHeight: 24,
    baseCellWidth: 40,
    minCellWidth: 10,
    maxCellWidth: 160,
    verticalCellRatio: 3,
    totalRows: 88,            // Piano roll standard
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
    snapDivisions: 4
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
