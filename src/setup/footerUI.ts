// src/setup/footerUI.js

import { getSequencers } from '../setup/sequencers.js';
import { drawGlobalMiniContour } from '../sequencer/ui/renderers/drawMiniContour.js';

export function initFooterUI(): void {
  const expandBtn = document.getElementById('global-mini-expand-btn') as HTMLElement | null;
  const contourCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  const playheadCanvas = document.getElementById('global-mini-playhead') as HTMLCanvasElement | null;
  const container = contourCanvas?.parentElement?.parentElement as HTMLElement | null;
  const roundedFrame = contourCanvas?.parentElement as HTMLElement | null;
  const iconUse = expandBtn?.querySelector('svg use') as SVGUseElement | null;
  const footerSpacer = document.querySelector('.footer-spacer') as HTMLElement | null;

  const initialHeight = 40;
  let isExpanded = false;

  function resizeCanvas(canvas: HTMLCanvasElement, heightPx: number): void {
    const width = canvas.offsetWidth;
    canvas.style.height = `${heightPx}px`;
    canvas.height = heightPx;
    canvas.width = width;
  }

  if (!expandBtn || !contourCanvas || !playheadCanvas || !container || !roundedFrame || !iconUse || !footerSpacer) {
    console.warn('FooterUI: One or more elements not found.');
    return;
  }

  // Initialize default height on load
  container.style.height = `${initialHeight}px`;
  roundedFrame.style.height = `${initialHeight}px`;
  resizeCanvas(contourCanvas, initialHeight);
  resizeCanvas(playheadCanvas, initialHeight);
  drawGlobalMiniContour(contourCanvas, getSequencers());

  function toggleExpand(): void {
    isExpanded = !isExpanded;
    const newHeight = isExpanded ? 200 : 40;

    if (!container || !roundedFrame || !contourCanvas || !playheadCanvas || !iconUse || !footerSpacer) return;

    container.style.height = `${newHeight}px`;
    roundedFrame.style.height = `${newHeight}px`;
    resizeCanvas(contourCanvas, newHeight);
    resizeCanvas(playheadCanvas, newHeight);
    iconUse.setAttribute('href', isExpanded ? '#icon-caret-down' : '#icon-caret-up');

    footerSpacer.style.height = `${newHeight - 40 + 140}px`;

    drawGlobalMiniContour(contourCanvas, getSequencers());
  }

  expandBtn.addEventListener('click', toggleExpand);
}
