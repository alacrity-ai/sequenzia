// src/playhead/playhead-engine.ts

import { PlaybackEngine } from '../sequencer/playback.js';
import { getTotalBeats } from '../sequencer/transport.js';
import { drawGlobalPlayhead } from './global-playhead.js';

let animationFrameId: number | null = null;

export function startMasterPlayheadLoop(engine: PlaybackEngine): void {
  const canvasWidth = 1260;
  const totalBeats = getTotalBeats();

  function drawFrame() {
    if (!engine.isActive()) return;

    const currentBeat = engine.getCurrentBeat();
    const globalX = (currentBeat / totalBeats) * canvasWidth;

    // 1. Global playhead
    drawGlobalPlayhead(globalX);

    // 2. Each sequencer grid
    for (const seq of engine['sequencers']) {
      if (seq?.grid?.drawPlayhead) {
        const localX = seq.grid.getXForBeat(currentBeat);
        seq.grid.drawPlayhead(localX);
      }
    }

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  cancelMasterPlayheadLoop();
  animationFrameId = requestAnimationFrame(drawFrame);
}

export function cancelMasterPlayheadLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function resetPlayheads(engine: PlaybackEngine): void {
    // Reset global playhead
    drawGlobalPlayhead(0);
  
    // Reset each sequencer grid's playhead
    for (const seq of engine['sequencers']) {
      if (seq?.grid?.drawPlayhead) {
        seq.grid.drawPlayhead(0);
      }
    }
}
  