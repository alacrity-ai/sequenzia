// src/globalControls/services/GlobalPlayheadService.ts

import { updateAllMatrixPlayheads } from '@/shared/playback/helpers/updateAllGridPlayheads.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { drawGlobalPlayhead } from '@/components/globalControls/renderers/GlobalPlayheadRenderer.js';

import type { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';

let animationFrameId: number | null = null;

/**
 * Starts the master visual playhead animation loop.
 * Draws both the global playhead and each matrix's local playhead.
 */
export function startGlobalPlayheadLoop(engine: PlaybackEngine, canvasWidth: number): void {
  const totalBeats = getTotalBeats();
  const DPR = window.devicePixelRatio || 1;
  const logicalWidth = canvasWidth / DPR;

  function drawFrame() {
    if (!engine.isActive()) return;

    const currentBeat = engine.getCurrentBeat();
    const globalX = (currentBeat / totalBeats) * logicalWidth;

    drawGlobalPlayhead(globalX);
    updateAllMatrixPlayheads(engine, currentBeat);

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  cancelGlobalPlayheadLoop();
  animationFrameId = requestAnimationFrame(drawFrame);
}
  

/**
 * Cancels the ongoing visual playhead loop.
 */
export function cancelGlobalPlayheadLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Resets both the global and all matrix playheads to 0.
 */
export function resetGlobalPlayheads(engine: PlaybackEngine): void {
  drawGlobalPlayhead(0);

  for (const seq of engine['sequencers']) {
    seq.matrix?.setPlayheadPixelX(0);
  }
}
