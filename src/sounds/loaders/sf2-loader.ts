// src/sounds/loaders/sf2-loader.ts

import { getAudioContext, getMasterGain } from '../../audio/audio.js';
import { Instrument } from '../interfaces/Instrument.js';
import { showLoadingModal, hideLoadingModal } from '../../sequencer/ui.js';
import * as smplr from 'smplr';

let activeInstrumentLoads = 0;

// Cache instruments per AudioContext
const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();

export async function loadInstrument(
  fullName: string,
  context: AudioContext = getAudioContext(),
  destination: AudioNode | null = null
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

  let instrument: Instrument;

  if (libraryRaw === 'smolken') {
    instrument = new smplr.Smolken(context, {
      instrument: instrumentName,
      destination: destination || getMasterGain(),
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'splendidgrandpiano') {
    instrument = new smplr.SplendidGrandPiano(context, {
      destination: destination || getMasterGain(),
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'mallets') {
    instrument = new smplr.Mallet(context, {
      instrument: instrumentName,
      destination: destination || getMasterGain(),
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'drummachines') {
    instrument = new smplr.DrumMachine(context, {
      instrument: instrumentName,
      destination: destination || getMasterGain(),
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

    // Build __midiMap for drum samples
    const sampleNames: string[] = instrument.getSampleNames?.() ?? [];
    const midiMap = new Map<number, string>();
    sampleNames.forEach((name, i) => {
      const midi = 36 + i; // C2 upward
      midiMap.set(midi, name);
    });
    instrument.__midiMap = midiMap;

  } else {
    const kitMap: Record<string, string> = {
      'fluidr3-gm': 'FluidR3_GM',
      'fatboy': 'FatBoy',
      'musyngkite': 'MusyngKite',
    };

    const kit = kitMap[libraryRaw.toLowerCase()] || 'MusyngKite';
    const availableKits = await getAvailableSoundfontKits();
    console.log(`[SF2] Available kits: ${availableKits.join(', ')}`);
    console.log(`[SF2] Loading from kit=${kit}, instrument=${instrumentName}`);

    const format = 'ogg';
    const url = `https://gleitz.github.io/midi-js-soundfonts/${kit}/${instrumentName}-${format}.js`;

    instrument = new smplr.Soundfont(context, {
      instrument: instrumentName,
      instrumentUrl: url,
      kit,
      destination: destination || getMasterGain(),
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);
  }

  instrumentMap.set(cacheKey, instrument);
  return instrument;
}

export async function getAvailableLibraries(): Promise<string[]> {
  console.log('[SF2] Getting available libraries');

  const kits = getAvailableSoundfontKits();
  console.log('[SF2] Available kits:', kits);

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
  console.log(`[SF2] Getting available instruments for library: ${library}`);

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
  await loadInstrument(`${library}/${dummyInstrument}`);
  const instruments = smplr.getSoundfontNames();
  console.log(`[SF2] Instruments in library "${library}":`, instruments);
  return instruments ?? [];
}

// Helper for Midi export
export function getDrumMachineInstruments() {
  return smplr.getDrumMachineNames();
}

// Internal loading feedback utilities
function onInstrumentLoadStart(): void {
  activeInstrumentLoads++;
  if (activeInstrumentLoads === 1) showLoadingModal();
}

function onInstrumentLoadEnd(): void {
  activeInstrumentLoads--;
  if (activeInstrumentLoads <= 0) {
    activeInstrumentLoads = 0;
    hideLoadingModal();
  }
}

async function withLoading<T>(loadPromise: Promise<T>): Promise<void> {
  onInstrumentLoadStart();
  try {
    await loadPromise;
  } finally {
    onInstrumentLoadEnd();
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