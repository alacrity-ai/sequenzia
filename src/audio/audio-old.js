// audio.js
import { noteToFrequency, noteToMidi } from './pitch-utils.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// — Visualization chain —
export const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 2048;

// — Master output gain (now exported!) —
export const masterGain = audioCtx.createGain();
masterGain.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

/**
 * Live‑playback helper: schedules one note on the main AudioContext,
 * returns a handle with stop()/forceStop() to kill it early.
 */
export function playNote(note) {
  const freq = noteToFrequency(note);
  const midi = noteToMidi(note);
  if (!freq || midi == null) return null;

  const osc    = audioCtx.createOscillator();
  const gain   = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();

  osc.type      = 'sine';
  osc.frequency.value = freq;

  // Pan curve from MIDI 48–83
  const norm       = Math.max(0, Math.min(1, (midi - 48) / (83 - 48)));
  const panRange   = 0.5;
  const centerOff  = 0.1;
  panner.pan.value = (norm - 0.5) * 2 * panRange + centerOff;

  osc.connect(gain);
  gain.connect(panner);
  panner.connect(masterGain);

  const now     = audioCtx.currentTime;
  const attack  = 0.01;
  const release = 0.2;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + attack);

  osc.start(now);

  return {
    stop: () => {
      const stopTime = audioCtx.currentTime + release;
      gain.gain.cancelScheduledValues(audioCtx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
      osc.stop(stopTime);
    },
    forceStop: () => {
      try { osc.stop(); } catch {}
      osc.disconnect(); gain.disconnect(); panner.disconnect();
    }
  };
}

/**
 * Headless‑export helper: schedules into *any* context + destination
 * (e.g. an OfflineAudioContext) at a given `when` and for `durationSec`.
 */
export function playNoteWithContext(note, context, destination, when = 0, durationSec = 1) {
  const freq = noteToFrequency(note);
  const midi = noteToMidi(note);
  if (!freq || midi == null) return;

  const osc    = context.createOscillator();
  const gain   = context.createGain();
  const panner = context.createStereoPanner();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);

  // Panning
  const norm      = Math.max(0, Math.min(1, (midi - 48) / (83 - 48)));
  const panRange  = 0.5;
  const centerOff = 0.1;
  panner.pan.setValueAtTime((norm - 0.5) * 2 * panRange + centerOff, when);

  const attack  = 0.01;
  const release = 0.2;
  const volume  = 0.2;
  
  const noteOff = when + durationSec;       // end of the *notated* note
  const attackEnd = when + attack;
  const stopTime = noteOff + release;
  
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, attackEnd);
  gain.gain.setValueAtTime(volume, noteOff);
  gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  osc.connect(gain);
  gain.connect(panner);
  panner.connect(destination);

  osc.start(when);
  osc.stop(stopTime);
}
