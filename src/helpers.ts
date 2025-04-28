import { sequencers } from './setup/sequencers.js';
import { drawMiniContour } from './sequencer/grid/drawing/mini-contour.js';
import { toggleZoomControls } from './setup/sequencers.js';

/**
 * Collapses all sequencers in the UI (hides body, shows mini-contour).
 * This does not modify app state or record any undoable diffs.
 */
export function collapseAllSequencers(): void {
  for (const seq of sequencers) {
    const wrapper = seq.container;
    if (!wrapper) continue; // Safety check in case container is null

    const body = wrapper.querySelector('.sequencer-body') as HTMLElement | null;
    const mini = wrapper.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
    const collapseIcon = wrapper.querySelector('.collapse-btn use') as SVGUseElement | null;

    if (!body || !mini) continue; // Defensive: skip if missing key elements

    if (!body.classList.contains('hidden')) {
      body.classList.add('hidden');
      mini.classList.remove('hidden');
      collapseIcon?.setAttribute('href', '#icon-caret-up');
      toggleZoomControls(wrapper, false);
      drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
    }
  }
}
