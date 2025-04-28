import { drawGlobalPlayhead } from './global-playhead.js';
import { getTotalBeats } from '../sequencer/transport.js'
import {
  setCurrentBeat,
  isTransportRunning,
  pauseTransport,
  resumeTransport
} from '../sequencer/transport.js';
import { sequencers } from '../setup/sequencers.js';
import { getSnappedBeat } from '../sequencer/grid/helpers/geometry.js';
import { GRID_CONFIG as config } from '../sequencer/grid/helpers/constants.js';

let isDragging = false;
let canvas = null;
let globalConfig = null;
let wasAutoPaused = false;

export function initGlobalPlayheadInteraction(targetCanvas, targetConfig) {
  canvas = targetCanvas;
  globalConfig = targetConfig;

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e) {
  if (isTransportRunning()) {
    pauseTransport();
    sequencers.forEach(s => s.pause?.());
    wasAutoPaused = true;
  }

  isDragging = true;
  updatePlayheadFromEvent(e);
}

function onMouseMove(e) {
  if (!isDragging) return;
  updatePlayheadFromEvent(e);
}

function onMouseUp() {
  if (!isDragging) return;
  isDragging = false;

  if (wasAutoPaused) {
    resumeTransport();
    sequencers.forEach(s => s.resume?.());
    wasAutoPaused = false;
  }
}

function updatePlayheadFromEvent(e) {
  const rect = canvas.getBoundingClientRect();

  // ✅ Device-pixel aware scaling
  const scaleX = canvas.width / rect.width;
  let x = (e.clientX - rect.left) * scaleX;

  // Clamp x to canvas width
  x = Math.max(0, Math.min(canvas.width, x));

  const totalBeats = getTotalBeats();
  const unsnappedBeat = (x / canvas.width) * totalBeats;
  
  // Apply snapping using the current config settings
  const snappedBeat = getSnappedBeat(unsnappedBeat, config);
  
  // Convert snapped beat back to x position
  const snappedX = (snappedBeat / totalBeats) * canvas.width;

  setCurrentBeat(snappedBeat);
  drawGlobalPlayhead(snappedX);
}
  
