// src/globalControls/listeners/GlobalPlayheadListeners.ts

import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';
import { updateAllMatrixPlayheads } from '@/shared/playback/helpers/updateAllGridPlayheads.js';
import { drawGlobalPlayhead } from '../renderers/GlobalPlayheadRenderer.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { getSnappedBeat } from '@/sequencer/utils/snappedBeat.js';
import { engine as playbackEngine } from '@/main.js';
import { SEQUENCER_CONFIG as config } from '@/sequencer/constants/sequencerConstants.js';

let isDragging = false;
let canvas: HTMLCanvasElement | null = null;
let wasAutoPaused = false;

export function attachPlayheadListeners(container: HTMLElement): ListenerAttachment {
  // Assume the canvas is the only or primary canvas in the container
  canvas = container.querySelector('#global-mini-playhead');
  if (!canvas) throw new Error('Playhead canvas not found in container.');

  const handleMouseDown = (e: MouseEvent) => {
    if (playbackEngine.isActive()) {
      playbackEngine.pause();
      wasAutoPaused = true;
    }

    isDragging = true;
    updatePlayheadFromEvent(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updatePlayheadFromEvent(e);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;

    updatePlayheadFromEvent(e);
    isDragging = false;

    if (wasAutoPaused) {
      playbackEngine.resume();
      wasAutoPaused = false;
    }
  };

  const updatePlayheadFromEvent = (e: MouseEvent) => {
    if (!canvas) return;

    const DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const logicalWidth = canvas.width / DPR;

    // Get x coordinate in CSS pixel space
    let x = (e.clientX - rect.left) * (logicalWidth / rect.width);
    x = Math.max(0, Math.min(logicalWidth, x));

    const totalBeats = getTotalBeats();
    const unsnappedBeat = (x / logicalWidth) * totalBeats;
    const snappedBeat = getSnappedBeat(unsnappedBeat, config);
    const snappedX = (snappedBeat / totalBeats) * logicalWidth;

    playbackEngine.seek(snappedBeat);
    updateAllMatrixPlayheads(playbackEngine, playbackEngine.getCurrentBeat());
    drawGlobalPlayhead(snappedX);
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return {
    detach: () => {
      canvas?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    },
    refreshUI: () => {
      // Optionally draw playhead on mount
    }
  };
}
