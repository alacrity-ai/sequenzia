import { getAudioContext, getMasterGain } from '../../audio/audio.js';
import { Instrument } from '../interfaces/Instrument.js';
import { showLoadingModal, hideLoadingModal } from '../../sequencer/ui.js';
import { pitchToMidi } from '../../audio/pitch-utils.js';
import { webAudioFontCatalogue } from './catalogues/webaudiofont-catalogue.js';

const DRUM_MIDI_RANGE = Array.from({ length: 47 }, (_, i) => 35 + i); // MIDI 35–81

// Declare global access to the dynamically injected player
declare global {
  interface Window {
    WebAudioFontPlayer: any;
  }
}

const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();
let player: any | null = null;

interface WebAudioFontInstrument extends Instrument {
  _preset: any;
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
    destination: AudioNode | null = null
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
  
      const instrument: WebAudioFontInstrument = {
        _preset: preset,
        start({ note, duration = 1, velocity = 100, time }) {
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
            velocity / 127
          );
        },
        stop() {},
        load: Promise.resolve(),
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
  
    const instrument: WebAudioFontInstrument = {
      _preset: drumPresets,
      start({ note, duration = 1, velocity = 100, time }) {
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
          velocity / 127
        );
      },
      stop() {},
      load: Promise.resolve(),
    };
  
    instrumentMap.set(cacheKey, instrument);
    return instrument;
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
