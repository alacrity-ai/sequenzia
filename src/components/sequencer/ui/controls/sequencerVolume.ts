// src/components/sequencer/ui/controls/sequencerVolume.ts

import Sequencer from '@/components/sequencer/sequencer.js';
import { recordDiff } from '@/appState/appState.js';
import { createSetVolumeDiff, createReverseSetVolumeDiff } from '@/appState/diffEngine/types/sequencer/setVolume.js';

export function setupVolumeBar(wrapper: HTMLElement, seq: Sequencer): void {
  const volumeBar = wrapper.querySelector('.volume-fill')?.parentElement as HTMLElement;
  const volumeFill = wrapper.querySelector('.volume-fill') as HTMLElement;
  const volumeThumb = wrapper.querySelector('.volume-thumb') as HTMLElement;

  let hasSnapped = false;
  let isShiftDown = false;
  let isDragging = false;
  let oldVolume: number | null = null;

  if (!volumeBar || !volumeFill) {
    console.warn('[setupVolumeBar] Volume bar or fill element missing.');
    return;
  }

  function updateVisualBar(): void {
    const clamped = Math.max(0, Math.min(1, seq.volume));
    const normalizedMax = 100 / 127;

    const barWidth = volumeBar.clientWidth;
    const thumbWidth = 14;
    const minX = 0;
    const maxX = barWidth - thumbWidth;

    const posX = clamped * barWidth;
    const clampedLeft = Math.max(minX, Math.min(maxX, posX - thumbWidth / 2));

    const fillPercent = Math.round(clamped * 100);
    volumeFill.style.width = `${fillPercent}%`;
    volumeThumb.style.left = `${clampedLeft}px`;

    const displayPercent = Math.round((clamped / normalizedMax) * 100);
    volumeBar.setAttribute('title', `Volume: ${displayPercent}%`);

    if (clamped > normalizedMax) {
      volumeFill.classList.add('overdrive');
      volumeThumb.classList.add('overdrive');
    } else {
      volumeFill.classList.remove('overdrive');
      volumeThumb.classList.remove('overdrive');
    }
  }

  function applyModifierStyles(): void {
    if (isShiftDown) {
      volumeFill.classList.add('precise');
      volumeThumb.classList.add('precise');
    } else {
      volumeFill.classList.remove('precise');
      volumeThumb.classList.remove('precise');
    }
  }

  seq.refreshVolumeUI = updateVisualBar;

  requestAnimationFrame(updateVisualBar);

  function handleVolumeInput(clientX: number): number {
    const rect = volumeBar.getBoundingClientRect();
    const relativeX = clientX - rect.left;

    const normalizedTarget = 100 / 127;
    const epsilon = 0.1;

    let newVolume = Math.max(0, Math.min(1, relativeX / rect.width));

    if (!isShiftDown && Math.abs(newVolume - normalizedTarget) < epsilon) {
      newVolume = normalizedTarget;
      if (!hasSnapped && navigator.vibrate) navigator.vibrate(10);
      hasSnapped = true;
    } else {
      hasSnapped = false;
    }

    seq.volume = newVolume;
    updateVisualBar();

    return newVolume;
  }

  volumeBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    isShiftDown = e.shiftKey;
    oldVolume = seq.volume;
    applyModifierStyles();
    handleVolumeInput(e.clientX);
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    isShiftDown = e.shiftKey;
    applyModifierStyles();
    handleVolumeInput(e.clientX);
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const finalVolume = handleVolumeInput(e.clientX);

    if (oldVolume !== null && finalVolume !== oldVolume) {
      recordDiff(
        createSetVolumeDiff(seq.id, finalVolume),
        createReverseSetVolumeDiff(seq.id, oldVolume)
      );
    }

    isShiftDown = false;
    applyModifierStyles();
    volumeFill.classList.remove('precise');
    volumeThumb.classList.remove('precise');
    updateVisualBar();

    oldVolume = null;
  });
}
