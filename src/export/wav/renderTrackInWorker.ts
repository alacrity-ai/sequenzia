// src/export/wav/renderTrackInWorker.ts

import type { TrackData as SessionTrack } from '@/components/sequencer/interfaces/Track.js';

export function renderTrackInWorker(
  state: SessionTrack,
  bpm: number,
  sampleRate: number,
  totalSeconds: number
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./track-renderer.worker.ts', import.meta.url), 
    { type: 'module' });

    worker.onmessage = (e) => {
      if ('error' in e.data) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data as AudioBuffer);
      }
      worker.terminate();
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };

    worker.postMessage({
      state,
      instrumentName: state.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano',
      bpm,
      sampleRate,
      totalSeconds,
    });
  });
}
