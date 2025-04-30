// src/setup/controls/sequencerPan.ts

import Sequencer from '../../sequencer/sequencer.js';
import { recordDiff } from '../../appState/appState.js';
import { createSetPanDiff, createReverseSetPanDiff } from '../../appState/diffEngine/types/sequencer/setPan.js';

export function setupPanBar(wrapper: HTMLElement, seq: Sequencer): void {
  const panBar = wrapper.querySelector('.pan-fill')?.parentElement as HTMLElement;
  const panFill = wrapper.querySelector('.pan-fill') as HTMLElement;
  const panThumb = wrapper.querySelector('.pan-thumb') as HTMLElement;

  let hasSnapped = false;
  let isShiftDown = false;
  let isDragging = false;
  let oldPan: number | null = null;

  if (!panBar || !panFill) {
    console.warn('[setupPanBar] Pan bar or fill element missing.');
    return;
  }

  function updateVisualBar(): void {
    const clamped = Math.max(-1, Math.min(1, seq.pan));
    const normalized = (clamped + 1) / 2; // Convert -1..1 to 0..1

    const barWidth = panBar.clientWidth;
    const thumbWidth = 14;
    const minX = 0;
    const maxX = barWidth - thumbWidth;

    const posX = normalized * barWidth;
    const clampedLeft = Math.max(minX, Math.min(maxX, posX - thumbWidth / 2));

    const fillPercent = Math.round(normalized * 100);
    panFill.style.width = `${fillPercent}%`;
    panThumb.style.left = `${clampedLeft}px`;

    const displayPan = Math.round(clamped * 100);
    panBar.setAttribute('title', `Pan: ${displayPan}%`);
  }

  seq.refreshPanUI = updateVisualBar;

  function applyModifierStyles(): void {
    if (isShiftDown) {
      panFill.classList.add('precise');
      panThumb.classList.add('precise');
    } else {
      panFill.classList.remove('precise');
      panThumb.classList.remove('precise');
    }
  }

  requestAnimationFrame(updateVisualBar);

  function handlePanInput(clientX: number): number {
    const rect = panBar.getBoundingClientRect();
    const relativeX = clientX - rect.left;
  
    let ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    let newPan = ratio * 2 - 1;
  
    const snapTarget = 0.0;
    const epsilon = 0.05;
  
    if (!isShiftDown && Math.abs(newPan - snapTarget) < epsilon) {
      newPan = snapTarget;
      if (!hasSnapped && navigator.vibrate) navigator.vibrate(10);
      hasSnapped = true;
    } else {
      hasSnapped = false;
    }
  
    seq.pan = newPan;
    updateVisualBar();
  
    return newPan;
  }  

  panBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    isShiftDown = e.shiftKey;
    oldPan = seq.pan;
    applyModifierStyles();
    handlePanInput(e.clientX);
    e.preventDefault();
  });
  
  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
  
    isDragging = false;
    const finalPan = handlePanInput(e.clientX);
  
    if (oldPan !== null && finalPan !== oldPan) {
      recordDiff(
        createSetPanDiff(seq.id, finalPan),
        createReverseSetPanDiff(seq.id, oldPan)
      );
    }
  
    isShiftDown = false;
    applyModifierStyles();
    panFill.classList.remove('precise');
    panThumb.classList.remove('precise');
    updateVisualBar();
  
    oldPan = null;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
  
    // Only check shift while dragging
    isShiftDown = e.shiftKey;
    applyModifierStyles();
    handlePanInput(e.clientX);
  });
}
