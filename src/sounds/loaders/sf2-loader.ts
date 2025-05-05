// src/sounds/loaders/sf2-loader.ts

import { getAudioContext, getMasterGain } from '../audio/audio.js';
import { Instrument } from '../interfaces/Instrument.js';
import { showLoadingModal, hideLoadingModal } from '../../global/loadingModal.js';
import * as smplr from 'smplr';

import { beginInstrumentLoad, endInstrumentLoad } from './loadingStore.js';


// Cache instruments per AudioContext
const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();

async function loadInstrumentWithOptionalLoading(
  instrument: Instrument,
  squelchLoadingScreen: boolean
): Promise<void> {
  if (squelchLoadingScreen) {
    await instrument.load;
  } else {
    await withLoading(instrument.load);
  }
}

export async function loadInstrument(
  fullName: string,
  context: AudioContext = getAudioContext(),
  destination: AudioNode | null = null,
  volume?: number, // float 0.0–1.0
  pan?: number, // Value -1.0 to 1.0
  squelchLoadingScreen?: boolean
): Promise<Instrument> {
  const parts = fullName.split('/');
  let engine = 'sf2';
  let libraryRaw = 'musyngkite';
  let instrumentName = 'acoustic_grand_piano';

  if (parts.length === 3) {
    [engine, libraryRaw, instrumentName] = parts;
  } else if (parts.length === 2) {
    [libraryRaw, instrumentName] = parts;
  } else if (parts.length === 1) {
    instrumentName = parts[0];
  }

  const isOffline = context instanceof OfflineAudioContext;

  if (!contextInstrumentMap.has(context)) {
    contextInstrumentMap.set(context, new Map());
  }
  const instrumentMap = contextInstrumentMap.get(context)!;

  const cacheKey = `${libraryRaw}/${instrumentName}`;
  if (instrumentMap.has(cacheKey)) {
    return instrumentMap.get(cacheKey)!;
  }

  const midiVolume = Math.max(0, Math.min(127, Math.round((volume ?? 1) * 127)));

  // === Panning Node Setup ===
  const pannerNode = context.createStereoPanner();
  if (pan !== undefined) {
    pannerNode.pan.value = pan;
  }

  const gainProxy = context.createGain();
  gainProxy.connect(pannerNode);
  pannerNode.connect(destination || getMasterGain());

  const commonOptions = {
    instrument: instrumentName,
    volume: midiVolume,
    destination: gainProxy,
    disableScheduler: isOffline,
  };

  let instrument: any;

  if (libraryRaw === 'smolken') {
    instrument = new smplr.Smolken(context, commonOptions);
  } else if (libraryRaw === 'splendidgrandpiano') {
    instrument = new smplr.SplendidGrandPiano(context, commonOptions);
  } else if (libraryRaw === 'mallets') {
    instrument = new smplr.Mallet(context, commonOptions);
  } else if (libraryRaw === 'drummachines') {
    instrument = new smplr.DrumMachine(context, commonOptions);
  } else {
    const kitMap: Record<string, string> = {
      'fluidr3-gm': 'FluidR3_GM',
      'fatboy': 'FatBoy',
      'musyngkite': 'MusyngKite',
    };
  
    const kit = kitMap[libraryRaw.toLowerCase()] || 'MusyngKite';
    const format = 'ogg';
    const url = `https://gleitz.github.io/midi-js-soundfonts/${kit}/${instrumentName}-${format}.js`;
  
    instrument = new smplr.Soundfont(context, {
      ...commonOptions,
      instrumentUrl: url,
      kit,
    });
  }
  
  await loadInstrumentWithOptionalLoading(instrument, squelchLoadingScreen ?? false);
  
  if (libraryRaw === 'drummachines') {
    const sampleNames: string[] = instrument.getSampleNames?.() ?? [];
    const midiMap = new Map<number, string>();
    sampleNames.forEach((name, i) => {
      const midi = 36 + i; // C2 upward
      midiMap.set(midi, name);
    });
    instrument.__midiMap = midiMap;
  }
  

  // === Augment with volume and pan setters ===
  const inst = instrument as Instrument;

  inst.setVolume = (normalizedVolume: number) => {
    const midiVolume = Math.max(0, Math.min(127, Math.round(normalizedVolume * 127)));
    if ('output' in inst && typeof (inst as any).output?.setVolume === 'function') {
      (inst as any).output.setVolume(midiVolume);
    }
  };

  inst.setPan = (newPan: number) => {
    pannerNode.pan.value = Math.max(-1, Math.min(1, newPan));
  };

  instrumentMap.set(cacheKey, inst);
  return inst;
}

export async function getAvailableLibraries(): Promise<string[]> {
  // Get all available kits
  const kits = getAvailableSoundfontKits();

  // Map smplr kits to lowercase names
  const mappedKits = kits.map(kit => {
    switch (kit) {
      case 'FluidR3_GM': return 'fluidr3-gm';
      case 'FatBoy': return 'fatboy';
      case 'MusyngKite': return 'musyngkite';
      default: return kit.toLowerCase();
    }
  });

  // Only add these manually, because they are NOT in the SoundfontKit listing
  const builtinSampleLibraries = [
    'splendidgrandpiano',
    'mallets',
    'drummachines',
    'smolken',
  ];

  return [...new Set([...mappedKits, ...builtinSampleLibraries])];
}

export function getAvailableSoundfontKits(): string[] {
  const kits = smplr.getSoundfontKits();
  const injectedKits = [...kits];

  if (!injectedKits.includes('FatBoy')) {
    injectedKits.push('FatBoy'); // Forcefully add FatBoy
  }

  return injectedKits;
}

export async function getAvailableInstruments(library: string): Promise<string[]> {
  console.log('GET AVAILABLE INSTRUMENTS CALLED')
  const libraryNormalized = library.toLowerCase();

  if (libraryNormalized === 'splendidgrandpiano') {
    return ['splendidgrandpiano']; // Only 1 instrument
  }
  if (libraryNormalized === 'mallets') {
    return smplr.getMalletNames();
  }
  if (libraryNormalized === 'drummachines') {
    return smplr.getDrumMachineNames();
  }
  if (libraryNormalized === 'smolken') {
    return smplr.getSmolkenNames();
  }

  // Otherwise treat it as a Soundfont
  const dummyInstrument = 'acoustic_grand_piano'; // preload safe assumption
  await loadInstrument(`${library}/${dummyInstrument}`, getAudioContext(), null, 0, 0, true);
  const instruments = smplr.getSoundfontNames();
  return instruments ?? [];
}

// Helper for Midi export
export function getDrumMachineInstruments() {
  return smplr.getDrumMachineNames();
}

async function withLoading<T>(loadPromise: Promise<T>): Promise<void> {
  beginInstrumentLoad();
  try {
    await loadPromise;
  } finally {
    endInstrumentLoad();
  }
}

// Expose engine entry point
export function getSf2Engine() {
  return {
    name: 'sf2',
    loadInstrument,
    getAvailableLibraries,
    getAvailableInstruments,
  };
}