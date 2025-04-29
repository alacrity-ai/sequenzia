import { Instrument } from './Instrument.js';

export interface Engine {
  name: string;

  getAvailableLibraries(): Promise<string[]>;
  getAvailableInstruments(library: string): Promise<string[]>;
  loadInstrument(
    fullName: string,
    context?: AudioContext,
    destination?: AudioNode
  ): Promise<Instrument>;
}
