// src/sequencer/ui/controls/zoomControls.ts

import { ListenerRegistry } from '@/components/sequencer/listeners/ListenerRegistry.js'; 

// Wire zoom controls
export function initZoomControls(
  wrapper: HTMLElement,
  zoomInFn: () => void,
  zoomOutFn: () => void,
  resetZoomFn: () => void,
  registry: ListenerRegistry
): void {
  const zoomInBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-in-btn');
  const zoomOutBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-out-btn');
  const zoomResetBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-reset-btn');

  if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn) return;

  registry.on(zoomInBtn, 'click', zoomInFn);
  registry.on(zoomOutBtn, 'click', zoomOutFn);
  registry.on(zoomResetBtn, 'click', resetZoomFn);
}

export function toggleZoomControls(wrapper: HTMLElement, show: boolean): void {
  wrapper.querySelector('.zoom-in-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-out-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-reset-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-button-divider')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.grip-handle')?.classList.toggle('hidden', !show);
}