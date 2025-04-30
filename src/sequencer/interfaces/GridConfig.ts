// src/sequencer/interfaces/GridConfig.ts

export interface GridConfig {
  cellWidth: number;
  cellHeight: number;
  visibleNotes: number;
  noteRange: [string, string];
  currentDuration: number;
  snapResolution: number;
  isTripletMode: boolean;
  loopEnabled: boolean;
  useEqualTemperament: boolean;
}
