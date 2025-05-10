// src/sounds/interfaces/Engine.ts

import { Instrument } from './Instrument.js';

export interface Engine {
  name: string;

  getAvailableLibraries(): Promise<string[]>;
  getAvailableInstruments(library: string): Promise<string[]>;
  loadInstrument(
    fullName: string,
    context?: AudioContext,
    destination?: AudioNode,
    volume?: number,
    pan?: number,
    squelchLoadingScreen?: boolean
  ): Promise<Instrument>;
}

export type EngineName = 'sf2' | 'webaudiofont';

export interface EnginePlayer {
  name: EngineName;
  setActiveInstrument(name: string): Promise<void>;
  getActiveInstrumentName(): string | null;
  playNote(pitch: string, velocity?: number, loop?: boolean): (() => void) | null;
  stopNoteByPitch(pitch: string): void;
  loadAndPlayNote(
    instrumentName: string,
    pitch: string,
    durationSec: number,
    velocity?: number,
    loop?: boolean,
    startTime?: number | null,
    context?: AudioContext | null,
    destination?: AudioNode | null,
    volume?: number,
    pan?: number
  ): Promise<null>;
}
