// audio/audio.ts

import { playNote as genericPlayNote } from '../instrument-player.js';

// — Audio context —
let _audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _audioCtx;
}

// — Visualization chain —
// (initialize later, not at module load)
let _analyserNode: AnalyserNode | null = null;
let _masterGain: GainNode | null = null;

export function getAnalyserNode(): AnalyserNode {
  if (!_analyserNode) {
    _analyserNode = getAudioContext().createAnalyser();
    _analyserNode.fftSize = 2048;
  }
  return _analyserNode;
}

export function getMasterGain(): GainNode {
  if (!_masterGain) {
    _masterGain = getAudioContext().createGain();
    getAnalyserNode().connect(getAudioContext().destination);
    _masterGain.connect(getAnalyserNode());
  }
  return _masterGain;
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
  getAudioContext().resume();
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
