// src/sounds/players/webaudiofont-player.ts

import { loadInstrument } from '../loaders/webaudiofont-loader.js';
import { getAudioContext } from '../../audio/audio.js';
import { pitchToMidi } from '../../audio/pitch-utils.js';
import { Instrument } from '../interfaces/Instrument.js';
import { EnginePlayer } from '../interfaces/Engine.js';

// Internal state
let activeInstrument: Instrument | null = null;
let activeName: string | null = null;

// Public API

async function setActiveInstrument(name: string): Promise<void> {
    if (activeName === name) return;
  
    const [, library, displayName] = name.split('/');
    const inst = await loadInstrument(`${library}/${displayName}`);
    activeInstrument = inst;
    activeName = name;
  
    console.log(`[WebAudioFont] Global keyboard instrument set to: ${name}`);
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
    if (midi === null) return null;
  
    activeInstrument.start({
      note: midi,
      velocity,
      time: now,
      duration: 1.5, // WebAudioFont has no real stop
      loop,
    });
  
    return () => {};
  }

function stopNoteByPitch(_pitch: string): void {
  // No-op: WebAudioFont has no stop support
}

async function loadAndPlayNote(
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
  
    const [, library, displayName] = instrumentName.split('/');
    const inst = await loadInstrument(`${library}/${displayName}`, ctx, destination);
  
    const midi = pitchToMidi(pitch);
    if (midi === null) return null;
  
    inst.start({
      note: midi,
      duration: durationSec,
      velocity,
      loop,
      time: startTime ?? ctx.currentTime,
    });
  
    return null;
  }
  

export function getWebAudioFontPlayer(): EnginePlayer {
  return {
    name: 'webaudiofont',
    setActiveInstrument,
    getActiveInstrumentName,
    playNote,
    stopNoteByPitch,
    loadAndPlayNote,
  };
}
