// src/export/wav/renderTrackInMainThread.ts

import { loadInstrument } from '../../sounds/instrument-loader-worker.js';
import { pitchToMidi } from '../../sounds/audio/pitch-utils.js';


export async function renderTrackInMainThread(
    state: any, 
    instrumentName: string, 
    bpm: number, 
    sampleRate: any,
    totalSeconds: any) {
  const OfflineCtx = globalThis.OfflineAudioContext ?? (globalThis as any).webkitOfflineAudioContext;
  if (!OfflineCtx) throw new Error('OfflineAudioContext not supported in this browser.');

  const context = new OfflineCtx(2, Math.ceil(sampleRate * totalSeconds), sampleRate);
  const beatDuration = 60 / bpm;

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

  return await context.startRendering();
}
