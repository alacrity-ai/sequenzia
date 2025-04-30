// src/sounds/loaders/webaudiofont-loader.ts

import { getAudioContext, getMasterGain } from '../../audio/audio.js';
import { Instrument } from '../interfaces/Instrument.js';
import { showLoadingModal, hideLoadingModal } from '../../sequencer/ui.js';
import { pitchToMidi } from '../../audio/pitch-utils.js';
import { webAudioFontCatalogue } from './catalogues/webaudiofont-catalogue.js';
import { DRUM_MIDI_RANGE } from './constants/drums.js';

// Declare global access to the dynamically injected player
declare global {
  interface Window {
    WebAudioFontPlayer: any;
  }
}

type StartOptions = {
    note: number | string;
    stopId?: number | string;
    velocity?: number;
    time?: number;
    loop?: boolean;
    duration?: number;
  };
  

const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();
let player: any | null = null;

interface WebAudioFontInstrument extends Instrument {
  _preset: any;
}

function getSafeWebAudioFontVolume(volume: number): number {
    return Math.max(volume, 0.0001); // WAF treats 0 as "use default (1.0)"
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

async function loadWebAudioFontPlayer(): Promise<void> {
  if (player) return;
  await loadScript('https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js');
  player = new window.WebAudioFontPlayer();
}

export async function loadInstrument(
    fullName: string,
    context: AudioContext = getAudioContext(),
    destination: AudioNode | null = null,
    volume?: number // Just added this here
  ): Promise<Instrument> {
    const [libraryRaw, instrumentDisplayName] = fullName.split('/');
    const cacheKey = `${libraryRaw}/${instrumentDisplayName}`;
  
    if (!contextInstrumentMap.has(context)) {
      contextInstrumentMap.set(context, new Map());
    }
    const instrumentMap = contextInstrumentMap.get(context)!;
    if (instrumentMap.has(cacheKey)) {
      return instrumentMap.get(cacheKey)!;
    }
  
    await loadWebAudioFontPlayer();

    const matched = webAudioFontCatalogue.find(
      entry => entry.library === libraryRaw && entry.displayName === instrumentDisplayName
    );
  
    if (!matched) {
      throw new Error(`Could not find WebAudioFont entry for library=${libraryRaw} and instrument=${instrumentDisplayName}`);
    }
  
    const isDrumKit = matched.displayName.startsWith('Drum Kit');
  
    if (!isDrumKit) {
      // Melodic instrument branch
      const varName = `_tone_${matched.id}`;
      const url = `https://surikov.github.io/webaudiofontdata/sound/${matched.id}.js`;
      await withLoading(loadScript(url));
  
      const preset = (window as any)[varName];
      if (!preset) throw new Error(`Missing preset: ${varName}`);
      player.loader.decodeAfterLoading(context, varName);
  
      // 🩹 Monkey-patch to fix async decoding in OfflineAudioContext
      if (context instanceof OfflineAudioContext) {
        const zones = preset?.zones ?? [];
        for (const zone of zones) {
        if (zone.file && !zone.buffer) {
            const binary = atob(zone.file);
            const buf = new ArrayBuffer(binary.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i);
            }
            zone.buffer = await new Promise((resolve, reject) =>
            context.decodeAudioData(buf, resolve, reject)
            );
          }
        }
      }

      const instrument: any = {
        _preset: preset,
        _volume: volume ?? 1.0,
        start({ note, duration = 1, velocity = 100, time }: StartOptions) {
          const midi = typeof note === 'string' ? pitchToMidi(note) : note;
          if (midi == null || typeof midi !== 'number') return;
      
          const when = typeof time === 'number' ? time : 0;
      
          player.queueWaveTable(
            context,
            destination || getMasterGain(),
            preset,
            when,
            midi,
            duration,
            getSafeWebAudioFontVolume(instrument._volume)
          );
        },
        stop() {},
        load: Promise.resolve(),
        setVolume(vol: number) {
          instrument._volume = Math.max(0, Math.min(1, vol));
        }
      };
      
  
      instrumentMap.set(cacheKey, instrument);
      return instrument;
    }
  
    // Drum kit branch
    const [, kitNumberStr, libraryName] = matched.id.match(/^12835_(\d+)_([A-Za-z0-9]+)_sf2_file$/)!;
    const kitNumber = parseInt(kitNumberStr, 10);
    const drumPresets: Record<number, any> = {};
  
    await withLoading(
      (async () => {
        for (const midi of DRUM_MIDI_RANGE) {
          const varName = `_drum_${midi}_${kitNumber}_${libraryName}_sf2_file`;
          const url = `https://surikov.github.io/webaudiofontdata/sound/${12800 + midi}_${kitNumber}_${libraryName}_sf2_file.js`;
  
          try {
            await loadScript(url);
            const preset = (window as any)[varName];
            if (!preset) {
              console.warn(`Missing drum preset: ${varName}`);
              continue;
            }
            player.loader.decodeAfterLoading(context, varName);
            drumPresets[midi] = preset;
          } catch (e) {
            console.warn(`Failed to load drum preset ${midi}: ${e}`);
          }
        }
      })()
    );
  
    const instrument: any = {
        _preset: drumPresets,
        _volume: volume ?? 1.0,
        start({ note, duration = 1, velocity = 100, time }: StartOptions) {
          const midi = typeof note === 'string' ? pitchToMidi(note) : note;
          if (midi == null || typeof midi !== 'number') {
            console.warn(`Invalid MIDI pitch: ${note}`);
            return;
          }
      
          const preset = drumPresets[midi];
          if (!preset) {
            console.warn(`No drum preset loaded for MIDI ${midi}`);
            return;
          }
      
          const when = typeof time === 'number' ? time : 0;
      
          player.queueWaveTable(
            context,
            destination || getMasterGain(),
            preset,
            when,
            midi,
            duration,
            getSafeWebAudioFontVolume(instrument._volume)
          );
        },
        stop() {},
        load: Promise.resolve(),
        setVolume(vol: number) {
          instrument._volume = Math.max(0, Math.min(1, vol)); // DO WE NEED TO UPDATE THIS AS WELL?
        }
    };
      
  
    instrumentMap.set(cacheKey, instrument as Instrument);
    return instrument as Instrument;      
  }
  
  

export async function getAvailableLibraries(): Promise<string[]> {
  const libraries = new Set<string>();
  for (const entry of webAudioFontCatalogue) {
    libraries.add(entry.library);
  }
  return Array.from(libraries);
}

export async function getAvailableInstruments(library: string): Promise<string[]> {
  return webAudioFontCatalogue
    .filter(entry => entry.library === library)
    .map(entry => entry.displayName);
}

async function withLoading<T>(promise: Promise<T>): Promise<T> {
  showLoadingModal();
  try {
    return await promise;
  } finally {
    hideLoadingModal();
  }
}

export function getWebAudioFontEngine() {
  return {
    name: 'webaudiofont',
    loadInstrument,
    getAvailableLibraries,
    getAvailableInstruments,
  };
}
