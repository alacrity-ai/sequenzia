// src/sf2/sf2-player.ts

import { loadInstrument, getAudioContext } from './sf2-loader.js';
import { pitchToMidi } from '../audio/pitch-utils.js';
import { Instrument } from './interfaces/Instrument.js';


// 🔁 For virtual keyboard
let activeInstrument: Instrument | null = null;
let activeName: string | null = null;

export async function setActiveInstrument(name: string): Promise<void> {
  if (activeName === name) return;

  const inst = await loadInstrument(name);
  activeInstrument = inst as Instrument;
  activeName = name;

  console.log(`[SF2] Global keyboard instrument set to: ${name}`);
}

export function getActiveInstrumentName(): string | null {
  return activeName;
}

/**
 * Global keyboard note playback
 */
export function playSF2Note(
  pitch: string,
  velocity: number = 100,
  loop: boolean = false
): (() => void) | null {
  if (!activeInstrument) return null;

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const midi = pitchToMidi(pitch);

  if (midi === null) return null; // defensive

  const note = activeInstrument.__midiMap?.get(midi) ?? midi;

  activeInstrument.start({
    note,
    stopId: note,
    velocity,
    time: now,
    loop,
  });

  return () => {
    activeInstrument?.stop({ stopId: note });
  };
}

/**
 * Stop a global keyboard note
 */
export function stopNoteByPitch(pitch: string): void {
  if (!activeInstrument) return;

  const midi = pitchToMidi(pitch);
  if (midi === null) return; // defensive

  const stopId = activeInstrument.__midiMap?.get(midi) ?? midi;
  activeInstrument.stop({ stopId });
}

/**
 * Per-sequencer playback using named instrument
 */
export async function loadAndPlayNote(
  instrumentName: string,
  pitch: string,
  durationSec: number,
  velocity: number = 100,
  loop: boolean = false,
  startTime: number | null = null,
  context: AudioContext | null = null,
  destination: AudioNode | null = null
): Promise<null> {
  const ctx = context || getAudioContext();
  const inst = await loadInstrument(instrumentName, ctx, destination);
  const midi = pitchToMidi(pitch);

  if (midi === null) return null; // defensive

  const note = inst.__midiMap?.get(midi) ?? midi;

  inst.start({
    note,
    duration: durationSec,
    velocity,
    loop,
    time: startTime ?? ctx.currentTime,
  });

  return null;
}
