// src/sounds/instrument-player.ts

import { getSf2Player } from './players/sf2-player.js';
import { getWebAudioFontPlayer } from './players/webaudiofont-player.js';
import { EngineName, EnginePlayer } from './interfaces/Engine.js';
import { getPreviewContext, getPreviewDestination } from './audio/previewContext.js';
import { getAudioContext } from './audio/audio.js';


// // Registry of available players
const enginePlayers: Record<EngineName, EnginePlayer> = {
    sf2: getSf2Player(),
    webaudiofont: getWebAudioFontPlayer()
};  

// Default engine
const DEFAULT_ENGINE: EngineName = 'sf2';

// 🔥 Public API

// Only for GLOBAL keyboard piano
let activeGlobalInstrumentFullName: string | null = null;

// Used by GLOBAL VIRTUAL PIANO only
export async function setGlobalActiveInstrument(
    fullName: string
  ): Promise<void> {
    if (!fullName.includes('/')) {
        throw new Error(`Invalid instrument name: "${fullName}". Expected "<engine>/<library>/<instrument>"`);
    }
      
    const engineName = fullName.split('/')[0] as EngineName;
    const engine = enginePlayers[engineName];
    if (!engine) throw new Error(`Engine "${engineName}" not available`);
  
    await engine.setActiveInstrument(fullName);
    activeGlobalInstrumentFullName = fullName;
}  

// Used to get GLOBAL VIRTUAL PIANO instrument
export function getGlobalActiveInstrumentName(): string | null {
  return activeGlobalInstrumentFullName;
}

// Used when loading notes normally
export async function setInstrumentForPlayback(
  fullName: string,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<void> {
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  await engine.setActiveInstrument(fullName);
}

// Used by the virtual piano
export function playNote(
    pitch: string,
    velocity: number = 100,
    loop: boolean = false
  ): (() => void) | null {
    if (!activeGlobalInstrumentFullName) return null;
  
    const engineName = activeGlobalInstrumentFullName.split('/')[0] as EngineName;
    const engine = enginePlayers[engineName];
    if (!engine) throw new Error(`Engine "${engineName}" not available`);
  
    return engine.playNote(pitch, velocity, loop);
}
  
// Crucial for stopping a sustained note, this is used by the virtual piano
export function stopNoteByPitch(pitch: string): void {
    if (!activeGlobalInstrumentFullName) return;
  
    const engineName = activeGlobalInstrumentFullName.split('/')[0] as EngineName;
    const engine = enginePlayers[engineName];
    if (!engine) throw new Error(`Engine "${engineName}" not available`);
  
    engine.stopNoteByPitch(pitch);
}


export async function loadAndPlayNote(
  instrumentName: string,
  pitch: string,
  durationSec: number = 1,
  velocity: number = 100,
  loop: boolean = false,
  startTime: number | null = null,
  context: AudioContext | null = null,
  destination: AudioNode | null = null,
  volume?: number,
  pan?: number
): Promise<null> {
  const engineName = instrumentName.split('/')[0] as EngineName;
  const engine = enginePlayers[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  let ctx = context ?? getAudioContext();
  let dst = destination;

  if (ctx.state === 'suspended') {
    console.warn('[loadAndPlayNote] Using preview context due to suspended main context');
    ctx = getPreviewContext();
    dst = getPreviewDestination();
  }

  return await engine.loadAndPlayNote(
    instrumentName,
    pitch,
    durationSec,
    velocity,
    loop,
    startTime,
    ctx,
    dst,
    volume,
    pan
  );
}



  
export function getAvailableEngines(): EngineName[] {
  return Object.keys(enginePlayers) as EngineName[];
}
