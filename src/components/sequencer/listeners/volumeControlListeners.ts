// src/components/sequencer/listeners/volumeControlListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { VolumeControlUI } from '../ui/topBar/volumeControl.js';

import { recordDiff } from '@/appState/appState.js';
import { createSetVolumeDiff, createReverseSetVolumeDiff } from '@/appState/diffEngine/types/sequencer/setVolume.js';

import type Sequencer from '@/components/sequencer/sequencer.js';

export function attachVolumeControlListeners(ui: VolumeControlUI, seq: Sequencer): ListenerAttachment {
  const { element: volumeBar, fill: volumeFill, thumb: volumeThumb } = ui;

  let isDragging = false;
  let isShiftDown = false;
  let hasSnapped = false;
  let oldVolume: number | null = null;

  const NORMALIZED_MAX = 100 / 127;
  const SNAP_EPSILON = 0.1;

  function updateVisualBar(): void {
    const clamped = Math.max(0, Math.min(1, seq.volume));
    const barWidth = volumeBar.clientWidth;
    const thumbWidth = 14;
    const minX = 0;
    const maxX = barWidth - thumbWidth;

    const posX = clamped * barWidth;
    const clampedLeft = Math.max(minX, Math.min(maxX, posX - thumbWidth / 2));

    volumeFill.style.width = `${Math.round(clamped * 100)}%`;
    volumeThumb.style.left = `${clampedLeft}px`;

    const displayPercent = Math.round((clamped / NORMALIZED_MAX) * 100);
    volumeBar.setAttribute('title', `Volume: ${displayPercent}%`);

    const overdrive = clamped > NORMALIZED_MAX;
    volumeFill.classList.toggle('overdrive', overdrive);
    volumeThumb.classList.toggle('overdrive', overdrive);
  }

  function applyModifierStyles(): void {
    volumeFill.classList.toggle('precise', isShiftDown);
    volumeThumb.classList.toggle('precise', isShiftDown);
  }

  function handleVolumeInput(clientX: number): number {
    const rect = volumeBar.getBoundingClientRect();
    const relativeX = clientX - rect.left;

    let newVolume = Math.max(0, Math.min(1, relativeX / rect.width));

    if (!isShiftDown && Math.abs(newVolume - NORMALIZED_MAX) < SNAP_EPSILON) {
      newVolume = NORMALIZED_MAX;
      if (!hasSnapped && navigator.vibrate) navigator.vibrate(10);
      hasSnapped = true;
    } else {
      hasSnapped = false;
    }

    seq.volume = newVolume;
    updateVisualBar();
    return newVolume;
  }

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true;
    isShiftDown = e.shiftKey;
    oldVolume = seq.volume;
    applyModifierStyles();
    handleVolumeInput(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    isShiftDown = e.shiftKey;
    applyModifierStyles();
    handleVolumeInput(e.clientX);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    isDragging = false;

    const finalVolume = handleVolumeInput(e.clientX);

    if (oldVolume !== null && finalVolume !== oldVolume) {
      recordDiff(
        createSetVolumeDiff(seq.id, finalVolume),
        createReverseSetVolumeDiff(seq.id, oldVolume)
      );
    }

    oldVolume = null;
    isShiftDown = false;
    hasSnapped = false;
    applyModifierStyles();
    updateVisualBar();
  };

  volumeBar.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return {
    detach: () => {
      volumeBar.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    },
    refreshUI: updateVisualBar
  };
}
