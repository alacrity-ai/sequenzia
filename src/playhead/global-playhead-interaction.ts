// src/playhead/global-playhead-interaction.ts

import { drawGlobalPlayhead } from './global-playhead.js';
import { getTotalBeats } from '../sequencer/transport.js';
import { getSnappedBeat } from '../sequencer/grid/helpers/geometry.js';
import type { GridConfig } from '../sequencer/interfaces/GridConfig.js';
import { engine as playbackEngine } from '../main.js';

let isDragging = false;
let canvas: HTMLCanvasElement | null = null;
let globalConfig: GridConfig | null = null;
let wasAutoPaused = false;

/**
 * Initializes global playhead dragging interaction on a given canvas.
 */
export function initGlobalPlayheadInteraction(targetCanvas: HTMLCanvasElement, targetConfig: GridConfig): void {
  canvas = targetCanvas;
  globalConfig = targetConfig;

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e: MouseEvent): void {
  if (playbackEngine.isActive()) {
    playbackEngine.pause(); // will suspend context + stop playhead loop
    wasAutoPaused = true;
  }

  isDragging = true;
  updatePlayheadFromEvent(e);
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging) return;
  updatePlayheadFromEvent(e);
}

function onMouseUp(e: MouseEvent): void {
  if (!isDragging) return;

  // ✅ Always update on mouse up — even if no move occurred
  updatePlayheadFromEvent(e);

  isDragging = false;

  if (wasAutoPaused) {
    playbackEngine.resume(); // restart from paused position
    wasAutoPaused = false;
  }
}

function updatePlayheadFromEvent(e: MouseEvent): void {
  if (!canvas || !globalConfig) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  let x = (e.clientX - rect.left) * scaleX;

  x = Math.max(0, Math.min(canvas.width, x));

  const totalBeats = getTotalBeats();
  const unsnappedBeat = (x / canvas.width) * totalBeats;
  const snappedBeat = getSnappedBeat(unsnappedBeat, globalConfig);
  const snappedX = (snappedBeat / totalBeats) * canvas.width;

  playbackEngine.seek(snappedBeat); // actual transport update
  drawGlobalPlayhead(snappedX);     // visual update
}
