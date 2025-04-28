// src/playhead/global-playhead-interaction.ts

import { drawGlobalPlayhead } from './global-playhead.js';
import { getTotalBeats, setCurrentBeat, isTransportRunning, pauseTransport, resumeTransport } from '../sequencer/transport.js';
import { sequencers } from '../setup/sequencers.js';
import { getSnappedBeat } from '../sequencer/grid/helpers/geometry.js';
import type { GridConfig } from '../sequencer/interfaces/GridConfig.js';

let isDragging = false;
let canvas: HTMLCanvasElement | null = null;
let globalConfig: GridConfig | null = null;
let wasAutoPaused = false;

/**
 * Initializes global playhead dragging interaction.
 */
export function initGlobalPlayheadInteraction(targetCanvas: HTMLCanvasElement, targetConfig: GridConfig): void {
  canvas = targetCanvas;
  globalConfig = targetConfig;

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e: MouseEvent): void {
  if (isTransportRunning()) {
    pauseTransport();
    sequencers.forEach(s => s.pause?.());
    wasAutoPaused = true;
  }

  isDragging = true;
  updatePlayheadFromEvent(e);
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging) return;
  updatePlayheadFromEvent(e);
}

function onMouseUp(): void {
  if (!isDragging) return;
  isDragging = false;

  if (wasAutoPaused) {
    resumeTransport();
    sequencers.forEach(s => s.resume?.());
    wasAutoPaused = false;
  }
}

function updatePlayheadFromEvent(e: MouseEvent): void {
  if (!canvas || !globalConfig) return;

  const rect = canvas.getBoundingClientRect();

  // ✅ Device-pixel aware scaling
  const scaleX = canvas.width / rect.width;
  let x = (e.clientX - rect.left) * scaleX;

  // Clamp x to canvas width
  x = Math.max(0, Math.min(canvas.width, x));

  const totalBeats = getTotalBeats();
  const unsnappedBeat = (x / canvas.width) * totalBeats;

  // Apply snapping using the current config settings
  const snappedBeat = getSnappedBeat(unsnappedBeat, globalConfig);

  // Convert snapped beat back to x position
  const snappedX = (snappedBeat / totalBeats) * canvas.width;

  setCurrentBeat(snappedBeat);
  drawGlobalPlayhead(snappedX);
}
