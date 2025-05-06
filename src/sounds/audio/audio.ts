// src/sounds/audio/audio.ts

import { playNote as genericPlayNote } from '../instrument-player.js';

// — Audio context singleton (main transport) —
let _audioCtx: AudioContext | null = null;
export function getAudioContext(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _audioCtx;
}

// — Context-aware caches —
const gainMap = new WeakMap<AudioContext, GainNode>();
const analyserMap = new WeakMap<AudioContext, AnalyserNode>();

export function getAnalyserNode(context: AudioContext = getAudioContext()): AnalyserNode {
  if (!analyserMap.has(context)) {
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyserMap.set(context, analyser);
  }
  return analyserMap.get(context)!;
}

export function getMasterGain(context: AudioContext = getAudioContext()): GainNode {
  if (!gainMap.has(context)) {
    const gain = context.createGain();
    const analyser = getAnalyserNode(context);
    gain.connect(analyser);
    analyser.connect(context.destination);
    gainMap.set(context, gain);
  }
  return gainMap.get(context)!;
}

/**
 * Handle returned by playNote, allowing early stop.
 */
export interface NoteHandle {
  stop: () => void;
  forceStop: () => void;
}

/**
 * Play a note using the active instrument (any engine).
 */
export function playNote(note: string): NoteHandle | null {
  // getAudioContext().resume();
  try {
    const stopFn = genericPlayNote(note, 100, false);
    if (!stopFn) return null;

    return {
      stop: stopFn,
      forceStop: stopFn,
    };
  } catch (err) {
    console.error('[playNote] Failed to play note', note, err);
    return null;
  }
}
