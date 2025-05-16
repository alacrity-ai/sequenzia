// src/globalControls/listeners/GlobalPlayheadListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';
import { getAIIndicatorEnabled } from '@/components/userSettings/store/userConfigStore.js';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { updateAllMatrixPlayheads } from '@/shared/playback/helpers/updateAllGridPlayheads.js';
import { drawGlobalPlayhead } from '@/components/globalControls/renderers/GlobalPlayheadRenderer.js';
import { getTotalBeats, getTimeSignature } from '@/shared/playback/transportService.js';
import { getSnappedBeat } from '@/components/sequencer/utils/snappedBeat.js';
import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { SEQUENCER_CONFIG as config } from '@/components/sequencer/constants/sequencerConstants.js';
import { matchesMacro } from '@/shared/keybindings/useKeyMacro';

let isDragging = false;
let canvas: HTMLCanvasElement | null = null;
let wasAutoPaused = false;

export function attachPlayheadListeners(container: HTMLElement): ListenerAttachment {
  canvas = container.querySelector('#global-mini-playhead');
  if (!canvas) throw new Error('Playhead canvas not found in container.');

  const playbackEngine = PlaybackEngine.getInstance();

  const seekToBeat = (unsnappedBeat: number, resumePlayback = true): void => {
    const totalBeats = getTotalBeats();
    const snappedBeat = getSnappedBeat(unsnappedBeat, config);
    const clampedBeat = Math.max(0, Math.min(totalBeats, snappedBeat));

    const wasPlaying = playbackEngine.isActive();

    // Temporarily disable auto-resume
    playbackEngine.seek(clampedBeat);

    // Update autocomplete target beat
    setAutoCompleteTargetBeat(clampedBeat);

    // Only auto-resume if explicitly desired (keyboard usage)
    if (resumePlayback && wasPlaying) {
      playbackEngine.resume();
    }

    updateAllMatrixPlayheads(playbackEngine, clampedBeat);

    if (canvas) {
      const DPR = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / DPR;
      const snappedX = (clampedBeat / totalBeats) * logicalWidth;
      drawGlobalPlayhead(snappedX);
    }

    if (getAIIndicatorEnabled()) {
      drawGlobalMiniContour();
    }
  };

  const updatePlayheadFromEvent = (e: MouseEvent): void => {
    if (!canvas) return;

    const DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const logicalWidth = canvas.width / DPR;

    let x = (e.clientX - rect.left) * (logicalWidth / rect.width);
    x = Math.max(0, Math.min(logicalWidth, x));

    const totalBeats = getTotalBeats();
    const unsnappedBeat = (x / logicalWidth) * totalBeats;

    seekToBeat(unsnappedBeat, false);
  };

  const handleMouseDown = async (e: MouseEvent): Promise<void> => {
    if (playbackEngine.isActive()) {
      await playbackEngine.pause(); // <-- wait for it to finish
      wasAutoPaused = true;
    }

    isDragging = true;
    updatePlayheadFromEvent(e);
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging) return;
    updatePlayheadFromEvent(e);
  };

  const handleMouseUp = (e: MouseEvent): void => {
    if (!isDragging) return;

    updatePlayheadFromEvent(e);
    isDragging = false;

    if (wasAutoPaused) {
      playbackEngine.resume();
      wasAutoPaused = false;
    }
  };

  const handleSeekKeydown = (e: KeyboardEvent): void => {
    const tag = (document.activeElement as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const totalBeats = getTotalBeats();
    const beatsPerMeasure = getTimeSignature();
    let unsnappedBeat = playbackEngine.getCurrentBeat();

    if (matchesMacro(e, 'SeekBackward')) {
      e.preventDefault();
      seekToBeat(unsnappedBeat - 1);
      return;
    }

    if (matchesMacro(e, 'SeekForward')) {
      e.preventDefault();
      seekToBeat(unsnappedBeat + 1);
      return;
    }

    if (matchesMacro(e, 'SeekMeasureBack')) {
      e.preventDefault();
      const current = Math.floor(unsnappedBeat);
      const measureStart = Math.floor(current / beatsPerMeasure) * beatsPerMeasure;
      unsnappedBeat = (current === measureStart)
        ? Math.max(0, measureStart - beatsPerMeasure)
        : measureStart;
      seekToBeat(unsnappedBeat);
      return;
    }

    if (matchesMacro(e, 'SeekMeasureForward')) {
      e.preventDefault();
      const current = Math.floor(unsnappedBeat);
      const measureStart = Math.floor(current / beatsPerMeasure) * beatsPerMeasure;
      const nextMeasureStart = measureStart + beatsPerMeasure;
      seekToBeat(Math.min(totalBeats, nextMeasureStart));
      return;
    }
  };

  // Attach event listeners
  canvas.addEventListener('mousedown', (e) => void handleMouseDown(e));
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('keydown', handleSeekKeydown);

  return {
    detach: () => {
      canvas?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleSeekKeydown);
    },
    refreshUI: () => {
      // Optionally draw playhead on mount
    }
  };
}
