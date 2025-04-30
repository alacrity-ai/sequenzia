// src/sf2/interfaces/Instrument.ts

export interface Instrument {
  start(options: {
    note: number | string;
    stopId?: number | string;
    velocity?: number;
    time?: number;
    loop?: boolean;
    duration?: number;
  }): void;
  stop(options: { stopId: number | string }): void;
  load: Promise<unknown>;
  __midiMap?: Map<number, number | string>;

  getSampleNames?(): string[];
  setVolume(volume: number): void;
}
