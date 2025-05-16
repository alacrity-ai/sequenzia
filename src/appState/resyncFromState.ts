import { getAppState } from '@/appState/appState.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '@/shared/playback/transportService.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { createSequencerController } from '@/components/sequencer/factories/sequencerControllerFactory.js';
import { drawMiniContour } from '@/components/sequencer/renderers/drawMiniContour.js';
import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';
import { syncLiveMatrixWithSerializedNotes } from '@/appState/utils/syncMatrixToSequencer.js';

import type { AppState, SequencerState } from '@/appState/interfaces/AppState.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';

interface SerializedSequencer extends SequencerState {
  config?: Partial<SequencerConfig>;
}

function sequencerIdsMatch(liveId: number | undefined, serializedId: number | undefined): boolean {
  return liveId !== undefined && serializedId !== undefined && liveId === serializedId;
}

/**
 * Resyncs all live sequencers and transport to match the current app state.
 */
export function resyncFromState(state: AppState = getAppState()): void {
  updateTempo(state.tempo, false);
  updateTimeSignature(state.timeSignature[0], false);
  updateTotalMeasures(state.totalMeasures, false);

  const sequencers = getSequencers();
  for (const seq of sequencers) {
    seq.updateTotalMeasures();
  }

  const container = document.getElementById('sequencers-container') as HTMLElement;
  if (!container) {
    console.error('resyncFromState: Missing #sequencers-container');
    return;
  }

  for (const serialized of state.sequencers as SerializedSequencer[]) {
    const live = sequencers.find(seq => sequencerIdsMatch(seq.id, serialized.id));

    if (!live) {
      const initialState: SequencerState = {
        id: serialized.id,
        instrument: serialized.instrument,
        notes: structuredClone(serialized.notes),
        volume: serialized.volume,
        pan: serialized.pan,
        collapsed: serialized.collapsed,
      };
      createSequencerController(container, initialState);
    } else {
      live.instrumentName = serialized.instrument;

      if (typeof serialized.volume === 'number') {
        live.volume = serialized.volume;
      }
      if (typeof serialized.pan === 'number') {
        live.pan = serialized.pan;
      }

      const miniCanvas = live.container?.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
      if (miniCanvas) {
        drawMiniContour(miniCanvas, serialized.notes, live.config, live.colorIndex);
      }

      if (live.matrix) {
        syncLiveMatrixWithSerializedNotes(live.matrix, serialized.notes, live, true);
      }
    }
  }

  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (canvas) {
    drawGlobalMiniContour();
  }
}
