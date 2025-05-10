/// <reference lib="webworker" />
/// <reference lib="dom" />
// src/export/wav/track-renderer.worker.ts


import { loadInstrument } from '@/sounds/instrument-loader-worker.js';

const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = async (e: MessageEvent) => {
  const { state, instrumentName, bpm, sampleRate, totalSeconds } = e.data;

    const OfflineCtx = globalThis.OfflineAudioContext ?? (globalThis as any).webkitOfflineAudioContext;
    if (!OfflineCtx) throw new Error("OfflineAudioContext not available in this worker.");
  
    const context = new OfflineCtx(2, Math.ceil(sampleRate * totalSeconds), sampleRate);
    const beatDuration = 60 / bpm;

  try {
    const instrument = await loadInstrument(instrumentName, context as any, context.destination);

    for (const note of state.notes) {
      const startSec = Math.max(0.01, note.start * beatDuration);
      const durationSec = note.duration * beatDuration;
      const midi = pitchToMidi(note.pitch);
      if (midi == null) continue;

      instrument.start({
        note: midi,
        duration: durationSec,
        velocity: note.velocity ?? 100,
        time: startSec,
      });
    }

    const rendered = await context.startRendering();
    ctx.postMessage(rendered, [rendered]);
  } catch (err) {
    ctx.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};

function pitchToMidi(pitch: string | null | undefined): number | null {
  const match = pitch?.match(/^([A-Ga-g])([#b]*)(-?\d+)$/);
  if (!match) return null;

  const [, base, accidentals, octaveStr] = match;
  const normalized = base.toUpperCase();
  const baseSemitone = NOTE_TO_MIDI[normalized];
  if (baseSemitone === undefined) return null;

  const accidentalShift = [...accidentals].reduce((acc, char) => {
    if (char === '#') return acc + 1;
    if (char === 'b') return acc - 1;
    return acc;
  }, 0);

  const octave = parseInt(octaveStr, 10);
  return 12 * (octave + 1) + (baseSemitone + accidentalShift);
}

const NOTE_TO_MIDI: Record<string, number> = {
    'C': 0,  'C#': 1,  'Db': 1,
    'D': 2,  'D#': 3,  'Eb': 3,
    'E': 4,  'Fb': 4,  'E#': 5,
    'F': 5,  'F#': 6,  'Gb': 6,
    'G': 7,  'G#': 8,  'Ab': 8,
    'A': 9,  'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11, 'B#': 0,
  };