import { Instrument } from './interfaces/Instrument.js';
import { getSf2Player } from './players/sf2-player.js';

type EngineName = 'sf2'; // Expandable later

// Registry of available players
const enginePlayers = {
  sf2: getSf2Player(),
  // webaudiofont: getWebaudiofontPlayer(), (to be added)
};

// Default engine
const DEFAULT_ENGINE: EngineName = 'sf2';

// 🔥 Public API

// Only for GLOBAL keyboard piano
let activeGlobalInstrumentFullName: string | null = null;

// 🛠 Used by GLOBAL VIRTUAL PIANO only
export async function setGlobalActiveInstrument(
  fullName: string,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<void> {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  await engine.setActiveInstrument(fullName);
  activeGlobalInstrumentFullName = fullName; // ✅ Only when global
}

// 🛠 Used to get GLOBAL VIRTUAL PIANO instrument
export function getGlobalActiveInstrumentName(): string | null {
  return activeGlobalInstrumentFullName;
}

// 🛠 Used when loading notes normally
export async function setInstrumentForPlayback(
  fullName: string,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<void> {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  await engine.setActiveInstrument(fullName);
}

// Used by the virtual piano primarily
export function playNote(
  pitch: string,
  velocity: number = 100,
  loop: boolean = false,
  engineName: EngineName = DEFAULT_ENGINE
): (() => void) | null {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);
  return engine.playNote(pitch, velocity, loop);
}

// Crucial for stopping a sustained note, this is used by the virtual piano primarily though
export function stopNoteByPitch(
  pitch: string,
  engineName: EngineName = DEFAULT_ENGINE
): void {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);
  return engine.stopNoteByPitch(pitch);
}

// This is used by the sequencer to play notes for an instrument
export async function loadAndPlayNote(
  instrumentName: string,
  pitch: string,
  durationSec: number,
  velocity: number = 100,
  loop: boolean = false,
  startTime: number | null = null,
  context: AudioContext | null = null,
  destination: AudioNode | null = null,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<null> {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);
  return await engine.loadAndPlayNote(
    instrumentName,
    pitch,
    durationSec,
    velocity,
    loop,
    startTime,
    context,
    destination
  );
}

export function getAvailableEngines(): EngineName[] {
  return Object.keys(enginePlayers) as EngineName[];
}
