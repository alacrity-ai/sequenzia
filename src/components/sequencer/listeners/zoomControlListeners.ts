// src/components/sequencer/listeners/zoomControlListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { ZoomControlUI } from '../ui/topBar/zoomControl.js';

export function attachZoomControlListeners(
  ui: ZoomControlUI,
  {
    onZoomIn,
    onZoomOut,
    onResetZoom
  }: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
  }
): ListenerAttachment {
  const { zoomInBtn, zoomOutBtn, zoomResetBtn, trailingDivider } = ui;

  let zoomVisible = false;

  const refreshUI = () => {
    zoomInBtn.classList.toggle('hidden', !zoomVisible);
    zoomOutBtn.classList.toggle('hidden', !zoomVisible);
    zoomResetBtn.classList.toggle('hidden', !zoomVisible);
    trailingDivider.classList.toggle('hidden', !zoomVisible);
  };

  const showZoomControls = () => {
    zoomVisible = true;
    refreshUI();
  };

  const hideZoomControls = () => {
    zoomVisible = false;
    refreshUI();
  };

  // Listeners
  zoomInBtn.addEventListener('click', onZoomIn);
  zoomOutBtn.addEventListener('click', onZoomOut);
  zoomResetBtn.addEventListener('click', onResetZoom);

  return {
    detach: () => {
      zoomInBtn.removeEventListener('click', onZoomIn);
      zoomOutBtn.removeEventListener('click', onZoomOut);
      zoomResetBtn.removeEventListener('click', onResetZoom);
    },
    refreshUI
  };
}
