import { drawGlobalPlayhead } from './global-playhead.js';
import { getTotalBeats } from '../helpers.js';
import {
  setCurrentBeat,
  isTransportRunning,
  pauseTransport,
  resumeTransport
} from '../sequencer/transport.js';
import { sequencers } from '../setup/sequencers.js';

let isDragging = false;
let canvas = null;
let config = null;
let wasAutoPaused = false;

export function initGlobalPlayheadInteraction(targetCanvas, globalConfig) {
  canvas = targetCanvas;
  config = globalConfig;

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
  
    const totalBeats = getTotalBeats(config);
    const beat = (x / canvas.width) * totalBeats;
  
    setCurrentBeat(beat);
    drawGlobalPlayhead(x);
  }
  
