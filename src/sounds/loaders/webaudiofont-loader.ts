// src/sounds/loaders/webaudiofont-loader.ts

import { getAudioContext, getMasterGain } from '../../audio/audio.js';
import { Instrument } from '../interfaces/Instrument.js';
import { showLoadingModal, hideLoadingModal } from '../../sequencer/ui.js';
import { pitchToMidi } from '../../audio/pitch-utils.js';

declare global {
  interface Window {
    WebAudioFontPlayer: any;
  }
}

const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();

// Lazy-initialize the player only once
let player: any | null = null;

interface WebAudioFontInstrument extends Instrument {
  _preset: any;
}

async function loadWebAudioFontPlayer(): Promise<any> {
  if (player) return player; // ✅ REUSE if already loaded

  if (!window.WebAudioFontPlayer) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load WebAudioFontPlayer.js'));
      document.head.appendChild(script);
    });
  }

  player = new window.WebAudioFontPlayer();
  return player;
}

async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.body.appendChild(script);
  });
}

export async function loadInstrument(
  fullName: string,
  context: AudioContext = getAudioContext(),
  destination: AudioNode | null = null
): Promise<Instrument> {
  const [engine, libraryRaw, instrumentRaw] = fullName.split('/');
  const cacheKey = `${libraryRaw}/${instrumentRaw}`;

  if (!contextInstrumentMap.has(context)) {
    contextInstrumentMap.set(context, new Map());
  }
  const instrumentMap = contextInstrumentMap.get(context)!;
  if (instrumentMap.has(cacheKey)) {
    return instrumentMap.get(cacheKey)!;
  }

  const varName = `_tone_${libraryRaw}_${instrumentRaw}`;
  const url = `https://surikov.github.io/webaudiofontdata/sound/${libraryRaw}_${instrumentRaw}.js`;

  await withLoading(loadScript(url));
  await loadWebAudioFontPlayer(); // ✅ load player AFTER script loaded

  const preset = (window as any)[varName];
  if (!preset) {
    throw new Error(`Instrument preset ${varName} not found in global scope after script load.`);
  }

  player.loader.decodeAfterLoading(context, varName);

  const instrument: WebAudioFontInstrument = {
    _preset: preset,

    start({ note, duration = 1, velocity = 100, time = context.currentTime }) {
      const midi = typeof note === 'string' ? pitchToMidi(note) : note;
      if (midi == null) return;
      player.queueWaveTable(
        context,
        destination || getMasterGain(),
        preset,
        time,
        midi,
        duration,
        (velocity ?? 100) / 127
      );
    },

    stop() {
      // WebAudioFont cannot stop notes individually, nothing we can do
    },

    load: Promise.resolve(), // Immediately resolved because we already loaded preset
  };

  instrumentMap.set(cacheKey, instrument);
  return instrument;
}

export async function getAvailableLibraries(): Promise<string[]> {
  return [
    '0000_JCLive_sf2_file',
    '0250_SoundBlasterOld_sf2',
    '0290_Aspirin_sf2_file',
  ];
}

export async function getAvailableInstruments(library: string): Promise<string[]> {
  // Each library has only 1 instrument in WebAudioFont
  return [library];
}

async function withLoading<T>(promise: Promise<T>): Promise<T> {
  showLoadingModal();
  try {
    return await promise;
  } finally {
    hideLoadingModal();
  }
}

// Engine API
export function getWebAudioFontEngine() {
  return {
    name: 'webaudiofont',
    loadInstrument,
    getAvailableLibraries,
    getAvailableInstruments,
  };
}
