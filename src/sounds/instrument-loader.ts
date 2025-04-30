// src/sounds/instrument-loader.ts

import { Instrument } from './interfaces/Instrument.js';
import { getSf2Engine } from './loaders/sf2-loader.js';
import { getWebAudioFontEngine } from './loaders/webaudiofont-loader.js';
import { EngineName } from './interfaces/Engine.js';

// Registry of available loaders
const engineLoaders = {
    sf2: getSf2Engine(),
    webaudiofont: getWebAudioFontEngine(),
};  

// Current default engine
const DEFAULT_ENGINE: EngineName = 'sf2';

// Public API

export async function loadInstrument(
    fullName: string,
    context?: AudioContext,
    destination?: AudioNode,
    volume?: number, // float 0.0–1.0
    pan?: number
  ): Promise<Instrument> {
    const parts = fullName.split('/');
    if (parts.length !== 3) {
      throw new Error(`Invalid instrument fullName format: "${fullName}". Expected format "engine/library/instrument"`);
    }
  
    const [engineName, libraryName, instrumentName] = parts;
  
    const engine = engineLoaders[engineName as EngineName];
    if (!engine) throw new Error(`Engine "${engineName}" not available`);
  
    console.log('Calling instrument-loader.ts LoadInstrument with:', fullName, engineName, context, destination, volume, pan);
  
    return await engine.loadInstrument(`${libraryName}/${instrumentName}`, context, destination, volume, pan);
}
  
export async function getAvailableLibraries(engineName: EngineName = DEFAULT_ENGINE): Promise<string[]> {
  const engine = engineLoaders[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);
  const libraries = await engine.getAvailableLibraries();
  console.log('getAvailableLibraries was called!: ', libraries);
  return libraries;
}

export async function getAvailableInstruments(
  libraryName: string,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<string[]> {
  const engine = engineLoaders[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  return await engine.getAvailableInstruments(libraryName);
}

export function getAvailableEngines(): EngineName[] {
  return Object.keys(engineLoaders) as EngineName[];
}
