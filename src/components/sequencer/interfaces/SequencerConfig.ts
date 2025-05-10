// src/components/sequencer/interfaces/SequencerConfig.ts

export interface SequencerConfig {
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
