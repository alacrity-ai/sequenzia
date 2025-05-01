// src/sounds/loaders/webaudiofont-worker-loader.ts

import { Instrument } from '../interfaces/Instrument.js';
import { pitchToMidi } from '../audio/pitch-utils.js';
import { webAudioFontCatalogue } from './catalogues/webaudiofont-catalogue.js';
import { DRUM_MIDI_RANGE } from './constants/drums.js';

const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();
let player: any | null = null;

type StartOptions = {
  note: number | string;
  stopId?: number | string;
  velocity?: number;
  time?: number;
  loop?: boolean;
  duration?: number;
};

function getSafeWebAudioFontVolume(volume: number): number {
  return Math.max(volume, 0.0001);
}

async function loadWebAudioFontPlayer(): Promise<void> {
    if (player) return;
  
    const url = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
    const response = await fetch(url);
    const scriptText = await response.text();
    eval(scriptText); // Injects into global scope (`self` in workers)
  
    player = (self as any).WebAudioFontPlayer 
      ? new (self as any).WebAudioFontPlayer()
      : null;
  
    if (!player) {
      throw new Error('Failed to load WebAudioFontPlayer in worker context.');
    }
  }
  

export async function loadInstrument(
  fullName: string,
  context: AudioContext,
  destination: AudioNode | null = null,
  volume?: number,
  pan?: number
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
    throw new Error(`Could not find WebAudioFont entry: ${fullName}`);
  }

  const gainProxy = context.createGain();
  const pannerNode = context.createStereoPanner();
  
  if (pan !== undefined) {
    pannerNode.pan.value = Math.max(-1, Math.min(1, pan));
  }
  
  gainProxy.connect(pannerNode);
  const output = context.createGain();
  pannerNode.connect(output);
  output.connect(destination || context.destination);  
  pannerNode.channelCount = 2;
  pannerNode.channelCountMode = 'explicit';

  const isDrumKit = matched.displayName.startsWith('Drum Kit');

  // === Melodic Instruments ===
  if (!isDrumKit) {
    const varName = `_tone_${matched.id}`;
    const url = `https://surikov.github.io/webaudiofontdata/sound/${matched.id}.js`;
    const { default: scriptText } = await import(/* @vite-ignore */ url);
    eval(scriptText); // Loads `_tone_xxx` global
    const preset = (self as any)[varName];
    if (!preset) throw new Error(`Missing preset: ${varName}`);

    player.loader.decodeAfterLoading(context, varName);

    // Manual decoding for OfflineAudioContext
    if (context instanceof OfflineAudioContext) {
      const zones = preset.zones ?? [];
      for (const zone of zones) {
        if (zone.file && !zone.buffer) {
          const binary = atob(zone.file);
          const buf = new ArrayBuffer(binary.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
          zone.buffer = await new Promise((resolve, reject) =>
            context.decodeAudioData(buf, resolve, reject)
          );
        }
      }
    }

    const instrument: any = {
      _preset: preset,
      _volume: volume ?? 1.0,
      _activeEnvelopes: [],
      start({ note, duration = 1, velocity = 100, time = 0 }: StartOptions) {
        const midi = typeof note === 'string' ? pitchToMidi(note) : note;
        if (midi == null) return;
        const finalVolume = getSafeWebAudioFontVolume((this as any)._volume) * (velocity / 127);
        const envelope = player.queueWaveTable(
          context,
          gainProxy,
          preset,
          time,
          midi,
          duration,
          finalVolume
        );
        (this as any)._activeEnvelopes.push(envelope);
      },
      stop() {
        for (const env of (this as any)._activeEnvelopes) {
          try {
            env.cancel?.();
            env.audioBufferSourceNode?.stop?.();
          } catch {}
        }
        (this as any)._activeEnvelopes = [];
      },
      setVolume(vol: number) {
        (this as any)._volume = Math.max(0, Math.min(1, vol));
      },
      setPan(value: number) {
        pannerNode.pan.value = Math.max(-1, Math.min(1, value));
      },
      load: Promise.resolve()
    };

    instrumentMap.set(cacheKey, instrument);
    return instrument;
  }

  // === Drum Kit Instruments ===
  const match = matched.id.match(/^12835_(\d+)_([A-Za-z0-9_]+)_sf2_file$/);
  if (!match) {
    throw new Error(`Invalid drum ID format: ${matched.id}`);
  }
  const [, kitNumberStr, libraryName] = match;
  const kitNumber = parseInt(kitNumberStr, 10);
  const drumPresets: Record<number, any> = {};

  for (const midi of DRUM_MIDI_RANGE) {
    const varName = `_drum_${midi}_${kitNumber}_${libraryName}_sf2_file`;
    const url = `https://surikov.github.io/webaudiofontdata/sound/${12800 + midi}_${kitNumber}_${libraryName}_sf2_file.js`;
    const { default: scriptText } = await import(/* @vite-ignore */ url);
    eval(scriptText);
    const preset = (self as any)[varName];
    if (!preset) continue;
    player.loader.decodeAfterLoading(context, varName);
    drumPresets[midi] = preset;
  }

  const instrument: any = {
    _preset: drumPresets,
    _volume: volume ?? 1.0,
    _activeEnvelopes: [],
    start({ note, duration = 1, velocity = 100, time = 0 }: StartOptions) {
      const midi = typeof note === 'string' ? pitchToMidi(note) : note;
      const preset = drumPresets[midi as any];
      if (!preset) return;
      const finalVolume = getSafeWebAudioFontVolume((this as any)._volume) * (velocity / 127);
      const envelope = player.queueWaveTable(
        context,
        gainProxy,
        preset,
        time,
        midi,
        duration,
        finalVolume
      );
      (this as any)._activeEnvelopes.push(envelope);
    },
    stop() {
      for (const env of (this as any)._activeEnvelopes) {
        try {
          env.cancel?.();
          env.audioBufferSourceNode?.stop?.();
        } catch {}
      }
      (this as any)._activeEnvelopes = [];
    },
    setVolume(vol: number) {
      (this as any)._volume = Math.max(0, Math.min(1, vol));
    },
    setPan(value: number) {
      pannerNode.pan.value = Math.max(-1, Math.min(1, value));
    },
    load: Promise.resolve()
  };

  instrumentMap.set(cacheKey, instrument);
  return instrument;
}
