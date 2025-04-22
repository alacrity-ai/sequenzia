import { getAppState } from './appState.js';
import { sequencers } from '../setup/sequencers.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '../sequencer/transport.js';

/**
 * Resyncs all live sequencers and transport to match the current app state.
 * This runs after any state diff is applied (e.g., from user actions or undo/redo).
 *
 * @param {Object} [state] - Optional state to sync from (defaults to current app state)
 */
export function resyncFromState(state = getAppState()) {
  // 🔁 Resync global transport parameters
  updateTempo(state.tempo);
  updateTimeSignature(...state.timeSignature); // [4,4] → 4, 4
  updateTotalMeasures(state.totalMeasures);

  // 🔁 Resync each sequencer by ID
  state.sequencers.forEach(serialized => {
    const live = sequencers.find(seq => seq.id === serialized.id);
    if (!live) return;

    // Sync instrument
    live.config.instrument = serialized.instrument;

    // Sync notes
    const gridCtx = live.grid.gridContext;
    gridCtx.setSelectedNotes([]);               // clear selection
    gridCtx.notes.length = 0;
    gridCtx.notes.push(...structuredClone(serialized.notes));

    live.grid.scheduleRedraw();
  });
}
