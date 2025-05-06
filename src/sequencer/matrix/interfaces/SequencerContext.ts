// src/sequencer/matrix/interfaces/SequencerContext.ts

// Context which will contain methods that the sequencer wants to hand over to the grid

export interface SequencerContext {
    playNote: (pitch: string, durationSec: number, velocity?: number, loop?: boolean) => void;
    getId: () => number;
  }
  