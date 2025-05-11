// src/components/sequencer/matrix/interfaces/GridTimingConfig.ts

export interface GridTimingConfig {
    totalMeasures: number;        // e.g. 16, 64, etc.
    beatsPerMeasure: number;      // 4 = 4/4, 3 = 3/4
    beatSubdivisions?: number;    // optional: for 16th note snapping (default: 4)
  }
  