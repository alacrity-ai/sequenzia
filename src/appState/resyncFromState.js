// src/appState/resyncFromState.js

import { getAppState } from './appState.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '../sequencer/transport.js';
import { createSequencer, toggleZoomControls, sequencers } from '../setup/sequencers.js';
import { drawGlobalMiniContour, drawMiniContour } from '../sequencer/mini-contour.js';

/**
 * Resyncs all live sequencers and transport to match the current app state.
 * This runs after any state diff is applied (e.g., from user actions or undo/redo).
 *
 * @param {Object} [state] - Optional state to sync from (defaults to current app state)
 */
export function resyncFromState(state = getAppState()) {
  // 🔁 Update transport globals
  updateTempo(state.tempo);
  updateTimeSignature(state.timeSignature[0]);
  updateTotalMeasures(state.totalMeasures);

  // 🔁 Ensure all sequencers exist and are in sync
  for (const serialized of state.sequencers) {
    let live = sequencers.find(seq => seq.id === serialized.id);

    if (!live) {
      // ⬇️ Create new sequencer if missing
      const { wrapper } = createSequencer({
        id: serialized.id,
        instrument: serialized.instrument,
        config: {
          ...serialized.config, // optional
        },
        notes: serialized.notes
      });

      // ⬇️ Attach additional UI handling (e.g. zoom controls)
      const zoomWrapper = wrapper.querySelector('.sequencer');
      if (zoomWrapper) {
        toggleZoomControls(zoomWrapper, true);
      }
    }

    // 🔁 Otherwise, update live sequencer’s state
    live.config.instrument = serialized.instrument;

    // ✅ REDRAW MINI CONTOUR if it exists (e.g., collapsed track)
    const miniCanvas = live.container.querySelector('canvas.mini-contour');
    if (miniCanvas) {
      drawMiniContour(miniCanvas, live.notes, live.config, live.colorIndex);
    }

    const gridCtx = live.grid.gridContext;
    gridCtx.setSelectedNotes([]);
    gridCtx.notes.length = 0;
    gridCtx.notes.push(...structuredClone(serialized.notes));
    live.grid.scheduleRedraw();
  }
  
  // 🔁 Global mini-contour update
  const canvas = document.getElementById('global-mini-contour');
  if (canvas) {
    drawGlobalMiniContour(canvas, sequencers);
  }
}
