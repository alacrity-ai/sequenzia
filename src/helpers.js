import { sequencers } from './setup/sequencers.js';
import { drawMiniContour } from './sequencer/grid/drawing/mini-contour.js';
import { toggleZoomControls } from './setup/sequencers.js';

/**
 * Collapses all sequencers in the UI (hides body, shows mini-contour).
 * This does not modify app state or record any undoable diffs.
 */
export function collapseAllSequencers() {
  for (const seq of sequencers) {
    const wrapper = seq.container;
    const body = wrapper.querySelector('.sequencer-body');
    const mini = wrapper.querySelector('canvas.mini-contour');
    const collapseIcon = wrapper.querySelector('.collapse-btn use');

    if (!body.classList.contains('hidden')) {
      body.classList.add('hidden');
      mini.classList.remove('hidden');
      collapseIcon?.setAttribute('href', '#icon-caret-up');
      toggleZoomControls(wrapper, false);
      drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
    }
  }
}
