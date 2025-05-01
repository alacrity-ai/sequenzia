// src/sounds/loaders/sf2-worker-loader.ts

import { Instrument } from '../interfaces/Instrument.js';
import * as smplr from 'smplr';

// Per-context cache
const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();

export async function loadInstrument(
  fullName: string,
  context: AudioContext,
  destination: AudioNode | null = null,
  volume?: number,
  pan?: number
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

  const pannerNode = context.createStereoPanner();
  if (pan !== undefined) pannerNode.pan.value = pan;

  const gainProxy = context.createGain();
  gainProxy.connect(pannerNode);
  pannerNode.connect(destination || context.destination);

  const commonOptions = {
    instrument: instrumentName,
    volume: midiVolume,
    destination: gainProxy,
    disableScheduler: isOffline,
  };

  let instrument: any;

  if (libraryRaw === 'smolken') {
    instrument = new smplr.Smolken(context, commonOptions);
    await instrument.load;

  } else if (libraryRaw === 'splendidgrandpiano') {
    instrument = new smplr.SplendidGrandPiano(context, commonOptions);
    await instrument.load;

  } else if (libraryRaw === 'mallets') {
    instrument = new smplr.Mallet(context, commonOptions);
    await instrument.load;

  } else if (libraryRaw === 'drummachines') {
    instrument = new smplr.DrumMachine(context, commonOptions);
    await instrument.load;

    const sampleNames: string[] = instrument.getSampleNames?.() ?? [];
    const midiMap = new Map<number, string>();
    sampleNames.forEach((name, i) => {
      const midi = 36 + i;
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
    const format = 'ogg';
    const url = `https://gleitz.github.io/midi-js-soundfonts/${kit}/${instrumentName}-${format}.js`;

    instrument = new smplr.Soundfont(context, {
      ...commonOptions,
      instrumentUrl: url,
      kit,
    });
    await instrument.load;

    // Offline patching (if needed) is assumed handled externally
  }

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
