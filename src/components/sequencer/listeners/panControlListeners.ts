// src/components/sequencer/listeners/panControlListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { PanControlUI } from '../ui/topBar/panControl.js';

import { recordDiff } from '@/appState/appState.js';
import { createSetPanDiff, createReverseSetPanDiff } from '@/appState/diffEngine/types/sequencer/setPan.js';

import type Sequencer from '@/components/sequencer/sequencer.js'; // Adjust if you rename/refactor

export function attachPanControlListeners(ui: PanControlUI, seq: Sequencer): ListenerAttachment {
  const { element: panBar, fill: panFill, thumb: panThumb } = ui;

  let isDragging = false;
  let isShiftDown = false;
  let hasSnapped = false;
  let oldPan: number | null = null;

  function updateVisualBar(): void {
    const clamped = Math.max(-1, Math.min(1, seq.pan));
    const normalized = (clamped + 1) / 2; // Map -1..1 to 0..1

    const barWidth = panBar.clientWidth;
    const thumbWidth = 14;
    const minX = 0;
    const maxX = barWidth - thumbWidth;

    const posX = normalized * barWidth;
    const clampedLeft = Math.max(minX, Math.min(maxX, posX - thumbWidth / 2));

    panFill.style.width = `${Math.round(normalized * 100)}%`;
    panThumb.style.left = `${clampedLeft}px`;

    const displayPan = Math.round(clamped * 100);
    panBar.setAttribute('title', `Pan: ${displayPan}%`);
  }

  function applyModifierStyles(): void {
    panFill.classList.toggle('precise', isShiftDown);
    panThumb.classList.toggle('precise', isShiftDown);
  }

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

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true;
    isShiftDown = e.shiftKey;
    oldPan = seq.pan;
    applyModifierStyles();
    handlePanInput(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    isShiftDown = e.shiftKey;
    applyModifierStyles();
    handlePanInput(e.clientX);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    isDragging = false;

    const finalPan = handlePanInput(e.clientX);

    if (oldPan !== null && finalPan !== oldPan) {
      recordDiff(
        createSetPanDiff(seq.id, finalPan),
        createReverseSetPanDiff(seq.id, oldPan)
      );
    }

    oldPan = null;
    isShiftDown = false;
    hasSnapped = false;
    applyModifierStyles();
    updateVisualBar();
  };

  panBar.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return {
    detach: () => {
      panBar.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    },
    refreshUI: updateVisualBar
  };
}
