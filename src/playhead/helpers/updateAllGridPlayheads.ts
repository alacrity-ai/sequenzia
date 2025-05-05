// src/playhead/helpers/updateAllGridPlayheads.ts

import { PlaybackEngine } from '../../sequencer/playback.js';

export function updateAllMatrixPlayheads(engine: PlaybackEngine, currentBeat: number): void {
  for (const seq of engine['sequencers']) {
    const matrix = seq.matrix;
    if (!matrix) continue;

    const pxPerBeat = matrix.getPixelsPerBeat?.();
    if (!pxPerBeat) continue;

    const x = currentBeat * pxPerBeat;
    matrix.setPlayheadPixelX(x);
  }
}
