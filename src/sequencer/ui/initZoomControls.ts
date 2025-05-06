// src/sequencer/ui/initZoomControls.ts

// Wire zoom controls
function initZoomControls(
  wrapper: HTMLElement,
  zoomInFn: () => void,
  zoomOutFn: () => void,
  resetZoomFn: () => void
): void {
  const zoomInBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-in-btn');
  const zoomOutBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-out-btn');
  const zoomResetBtn = wrapper.querySelector<HTMLButtonElement>('.zoom-reset-btn');

  if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn) return;

  zoomInBtn.addEventListener('click', zoomInFn);
  zoomOutBtn.addEventListener('click', zoomOutFn);
  zoomResetBtn.addEventListener('click', resetZoomFn);
}