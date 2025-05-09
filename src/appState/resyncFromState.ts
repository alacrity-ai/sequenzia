// src/appState/resyncFromState.ts

import { getAppState } from './appState.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '@/shared/playback/transportService.js';
import { createSequencer, sequencers } from '../sequencer/factories/SequencerFactory.js';
import { drawMiniContour } from '../sequencer/ui/renderers/drawMiniContour.js';
import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';
import { AppState, SequencerState } from './interfaces/AppState.js';
import { SequencerConfig } from '../sequencer/interfaces/SequencerConfig.js';
import { syncLiveMatrixWithSerializedNotes } from './utils/syncMatrixToSequencer.js';

interface SerializedSequencer extends SequencerState {
  config?: Partial<SequencerConfig>; // optional loose config, typed better
}

function sequencerIdsMatch(liveId: number | undefined, serializedId: number | undefined): boolean {
  return liveId !== undefined && serializedId !== undefined && liveId === serializedId;
}

/**
 * Resyncs all live sequencers and transport to match the current app state.
 * Runs after diffs are applied (user actions or undo/redo).
 *
 * @param state - Optional app state to sync from (defaults to current app state)
 */
export function resyncFromState(state: AppState = getAppState()): void {
  // 🔁 Update transport globals
  updateTempo(state.tempo, false);
  updateTimeSignature(state.timeSignature[0], false);
  updateTotalMeasures(state.totalMeasures, false);

  // Update grid width of each live sequencer
  for (const seq of sequencers) {
    seq.updateTotalMeasures();
  }

  // 🔁 Sync each serialized sequencer
  for (const serialized of state.sequencers as SerializedSequencer[]) {
    const live = sequencers.find(seq => sequencerIdsMatch(seq.id, serialized.id));

    if (!live) {
      // Create new sequencer if missing
      const initialState: SequencerState = {
        id: serialized.id,
        instrument: serialized.instrument,
        notes: structuredClone(serialized.notes),
        volume: serialized.volume,
        pan: serialized.pan,
      };

      void createSequencer(initialState);
    } else {
      // 🔁 Update existing live sequencer
      live.instrumentName = serialized.instrument;

      // Update the volume and pan
      if (typeof serialized.volume === 'number') {
        live.volume = serialized.volume;
      }
      if (typeof serialized.pan === 'number') {
        live.pan = serialized.pan;
      }

      // Redraw mini contour
      const miniCanvas = live.container?.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
      if (miniCanvas) {
        drawMiniContour(miniCanvas, serialized.notes, live.config, live.colorIndex);
      }

      // Sync notes and selection to matrix
      if (live.matrix) {
        syncLiveMatrixWithSerializedNotes(live.matrix, serialized.notes, live, true);
      }
    }
  }

  // 🔁 Global mini-contour update
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (canvas) {
    drawGlobalMiniContour();
  }
}
