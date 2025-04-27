// src/setup/footerUI.js

import { getSequencers } from '../setup/sequencers.js';
import { drawGlobalMiniContour } from '../sequencer/grid/drawing/mini-contour.js';

export function initFooterUI() {
    const expandBtn = document.getElementById('global-mini-expand-btn');
    const contourCanvas = document.getElementById('global-mini-contour');
    const playheadCanvas = document.getElementById('global-mini-playhead');
    const container = contourCanvas?.parentElement?.parentElement;
    const roundedFrame = contourCanvas?.parentElement;
    const iconUse = expandBtn.querySelector('svg use');
    const footerSpacer = document.querySelector('.footer-spacer');
  
    const initialHeight = 40;
    let isExpanded = false;
  
    function resizeCanvas(canvas, heightPx) {
      const width = canvas.offsetWidth;
      canvas.style.height = heightPx + 'px';
      canvas.height = heightPx;
      canvas.width = width;
    }
  
    // ✅ Initialize default height on load
    container.style.height = initialHeight + 'px';
    roundedFrame.style.height = initialHeight + 'px';
    resizeCanvas(contourCanvas, initialHeight);
    resizeCanvas(playheadCanvas, initialHeight);
    drawGlobalMiniContour(contourCanvas, getSequencers());
  
    function toggleExpand() {
        isExpanded = !isExpanded;
        const newHeight = isExpanded ? 200 : 40;
      
        container.style.height = newHeight + 'px';
        roundedFrame.style.height = newHeight + 'px';
        resizeCanvas(contourCanvas, newHeight);
        resizeCanvas(playheadCanvas, newHeight);
        iconUse.setAttribute('href', isExpanded ? '#icon-caret-down' : '#icon-caret-up');
      
        footerSpacer.style.height = (newHeight - 40 + 140) + 'px';
      
        drawGlobalMiniContour(contourCanvas, getSequencers());
      }      
  
    expandBtn?.addEventListener('click', toggleExpand);
  }
  