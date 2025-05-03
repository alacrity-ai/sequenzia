// src/sequencer/matrix/interfaces/GridConfigTypes.ts

import type { GridTimingConfig } from './GridTimingConfig.js';

export interface GridLayoutConfig {
  labelWidth: number;          // Width of the left label column (px)
  headerHeight: number;        // Height of the top playhead header (px)
  minCellWidth: number;        // Minimum width of a beat cell
  maxCellWidth: number;        // Maximum width of a beat cell
  baseCellWidth: number;       // Base width (unzoomed, 1x)
  verticalCellRatio: number;   // Height = width / ratio (e.g., 3 = piano roll proportions)
  totalRows: number;           // Total vertical note rows
  lowestMidi: number;          // MIDI note corresponding to row 0
}

export interface GridDisplayConfig {
  showMeasureLines: boolean;
  showBeatLines: boolean;
  showHoveredCell: boolean;
  highlightCurrentMeasure: boolean;
}

export interface GridBehaviorConfig {
  zoom: number;
  scrollMargin: number;
  enableSnapping: boolean;
  snapDivisions: number;
}

export interface GridConfig extends GridTimingConfig {
  layout: GridLayoutConfig;
  display: GridDisplayConfig;
  behavior: GridBehaviorConfig;
}
