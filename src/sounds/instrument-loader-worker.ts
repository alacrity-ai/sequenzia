// src/sounds/instrument-loader-worker.ts

import { loadInstrument as loadSF2Instrument } from './loaders/sf2-worker-loader.js';
import { loadInstrument as loadWAFInstrument } from './loaders/webaudiofont-worker-loader.js';

export async function loadInstrument(
  fullName: string,
  context: AudioContext,
  destination: AudioNode,
  volume?: number,
  pan?: number
) {
  const parts = fullName.split('/');
  if (parts.length !== 3) {
    throw new Error(`Invalid instrument format: ${fullName}`);
  }

  const [engine, library, name] = parts;

  switch (engine) {
    case 'sf2':
      return await loadSF2Instrument(`${library}/${name}`, context, destination, volume, pan);
    case 'webaudiofont':
      return await loadWAFInstrument(`${library}/${name}`, context, destination, volume, pan);
    default:
      throw new Error(`Unknown engine: ${engine}`);
  }
}
