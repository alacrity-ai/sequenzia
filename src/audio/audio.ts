// audio/audio.ts

import { playSF2Note } from '../sf2/sf2-player.js';

// — Audio context —
export const audioCtx: AudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// — Visualization chain —
export const analyserNode: AnalyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 2048;

// — Master output gain (now exported!) —
export const masterGain: GainNode = audioCtx.createGain();
masterGain.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

/**
 * Handle returned by playNote, allowing early stop.
 */
export interface NoteHandle {
  stop: () => void;
  forceStop: () => void;
}

/**
 * Play a note using the active SF2 instrument.
 * Returns a handle with stop() to end it early, or null if failed.
 */
export function playNote(note: string): NoteHandle | null {
  audioCtx.resume();
  try {
    const stopFn = playSF2Note(note, 100, false);
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

// Try resuming AudioContext on startup
audioCtx.resume().catch(err => {
  console.warn('Failed to resume AudioContext:', err);
});
