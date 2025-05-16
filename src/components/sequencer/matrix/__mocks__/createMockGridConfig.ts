// src/components/sequencer/matrix/__mocks__/createMockGridConfig.ts

import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes';

/**
 * Factory function to create a mock GridConfig for testing.
 * Provides default values mimicking a typical grid layout.
 */
export function createMockGridConfig(overrides: Partial<GridConfig> = {}): GridConfig {
  const mock: GridConfig = {
    layout: {
      labelWidthColumns: 2,
      headerHeightRows: 1,
      footerHeightRows: 1,
      labelWidth: 100,
      headerHeight: 40,
      footerHeight: 30,
      minCellWidth: 20,
      maxCellWidth: 100,
      baseCellWidth: 50,
      verticalCellRatio: 3,
      highestMidi: 108,  // C8
      lowestMidi: 21     // A0
    },
    display: {
      showMeasureLines: true,
      showBeatLines: true,
      showHoveredCell: true,
      highlightCurrentMeasure: true
    },
    behavior: {
      zoom: 1.0,
      scrollMargin: 10,
      enableSnapping: true,
      snapDivisions: 4,
      maxZoom: 4.0,
      minZoom: 0.25
    },
    totalMeasures: 64,
    beatsPerMeasure: 4,
    beatSubdivisions: 4
  };

  return { ...mock, ...overrides };
}
