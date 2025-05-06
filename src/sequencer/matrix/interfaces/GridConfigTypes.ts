// src/sequencer/matrix/interfaces/GridConfigTypes.ts

import type { GridTimingConfig } from './GridTimingConfig.js';

export interface GridLayoutConfig {
  labelWidthColumns: number;   // Width of the left label column (columns)
  headerHeightRows: number;    // Height of the top playhead header (rows)
  footerHeightRows: number;    // Height of the bottom footer (rows)
  labelWidth: number;          // Width of the left label column (pixels)
  headerHeight: number;        // Height of the top playhead header (pixels)
  footerHeight: number;        // Height of the bottom footer (pixels)
  minCellWidth: number;        // Minimum width of a beat cell
  maxCellWidth: number;        // Maximum width of a beat cell
  baseCellWidth: number;       // Base width (unzoomed, 1x)
  verticalCellRatio: number;   // Height = width / ratio (e.g., 3 = piano roll proportions)
  highestMidi: number;         // MIDI note corresponding to row N
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
  maxZoom: number;
  minZoom: number;
}

export interface GridConfig extends GridTimingConfig {
  layout: GridLayoutConfig;
  display: GridDisplayConfig;
  behavior: GridBehaviorConfig;
}
