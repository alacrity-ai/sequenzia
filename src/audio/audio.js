// audio/audio.js

import { playSF2Note } from '../sf2/sf2-player.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// — Visualization chain —
export const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 2048;

// — Master output gain (now exported!) —
export const masterGain = audioCtx.createGain();
masterGain.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

/**
 * Play a note using the active SF2 instrument.
 * Returns a handle with stop() to end it early.
 */
export function playNote(note) {
    audioCtx.resume();
    try {
      const stopFn = playSF2Note(note, 100, 20); // ✅ include duration
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

audioCtx.resume().catch(err => {
    console.warn('Failed to resume AudioContext:', err);
  });
  