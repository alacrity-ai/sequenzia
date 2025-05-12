// src/sounds/instrument-loader.ts

import { Instrument } from './interfaces/Instrument.js';
import { getSf2Engine } from './loaders/sf2-loader.js';
import { getWebAudioFontEngine } from './loaders/webaudiofont-loader.js';
import { EngineName } from './interfaces/Engine.js';

// Registry of available loaders
export const engineLoaders = {
    sf2: getSf2Engine(),
    webaudiofont: getWebAudioFontEngine(),
};  

// Current default engine
export const DEFAULT_ENGINE: EngineName = 'sf2';

// Public API

export async function loadInstrument(
    fullName: string,
    context?: AudioContext,
    destination?: AudioNode,
    volume?: number, // float 0.0–1.0
    pan?: number,
    squelchLoadingScreen?: boolean,
    allowSharedInstance: boolean = true
  ): Promise<Instrument> {
    const parts = fullName.split('/');
    if (parts.length !== 3) {
      throw new Error(`Invalid instrument fullName format: "${fullName}". Expected format "engine/library/instrument"`);
    }
  
    const [engineName, libraryName, instrumentName] = parts;
    const engine = engineLoaders[engineName as EngineName];
    if (!engine) throw new Error(`Engine "${engineName}" not available`);
    return await engine.loadInstrument(`${libraryName}/${instrumentName}`, context, destination, volume, pan, squelchLoadingScreen, allowSharedInstance);
}
