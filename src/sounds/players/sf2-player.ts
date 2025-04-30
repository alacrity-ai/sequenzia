// src/sf2/sf2-player.ts

import { loadInstrument } from '../loaders/sf2-loader.js';
import { getAudioContext } from '../../audio/audio.js';
import { pitchToMidi } from '../../audio/pitch-utils.js';
import { Instrument } from '../interfaces/Instrument.js';
import { EnginePlayer } from '../interfaces/Engine.js';

// State
let activeInstrument: Instrument | null = null;
let activeName: string | null = null;

// Public sf2 player object

async function setActiveInstrument(name: string): Promise<void> {
  if (activeName === name) return;

  const inst = await loadInstrument(name);
  activeInstrument = inst as Instrument;
  activeName = name;

  console.log(`[SF2] Global keyboard instrument set to: ${name}`);
}

function getActiveInstrumentName(): string | null {
  return activeName;
}

function playNote(
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

function stopNoteByPitch(pitch: string): void {
  if (!activeInstrument) return;

  const midi = pitchToMidi(pitch);
  if (midi === null) return;

  const stopId = activeInstrument.__midiMap?.get(midi) ?? midi;
  activeInstrument.stop({ stopId });
}

async function loadAndPlayNote(
  instrumentName: string,
  pitch: string,
  durationSec: number,
  velocity: number = 100,
  loop: boolean = false,
  startTime: number | null = null,
  context: AudioContext | null = null,
  destination: AudioNode | null = null,
  volume?: number
): Promise<null> {
  const ctx = context || getAudioContext();
  const inst = await loadInstrument(instrumentName, ctx, destination, volume);
  if (volume !== undefined && inst.setVolume) {
    inst.setVolume(volume);
  }
  const midi = pitchToMidi(pitch);
  if (midi === null) return null;

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

export function getSf2Player(): EnginePlayer {
  return {
    name: 'sf2',
    setActiveInstrument,
    getActiveInstrumentName,
    playNote,
    stopNoteByPitch,
    loadAndPlayNote,
  };
}
