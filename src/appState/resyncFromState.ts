// src/appState/resyncFromState.ts

import { getAppState } from './appState.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '../sequencer/transport.js';
import { createSequencer, toggleZoomControls, sequencers } from '../setup/sequencers.js';
import { drawGlobalMiniContour, drawMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { AppState, SequencerState } from './interfaces/AppState.js';
import { NotePosition } from '../sequencer/interfaces/Grid.js';
import { GRID_CONFIG } from '../sequencer/grid/helpers/constants.js';
import { GridConfig } from '../sequencer/interfaces/GridConfig.js';

interface SerializedSequencer extends SequencerState {
  config?: { [key: string]: any }; // optional loose config
}

function sequencerIdsMatch(liveId: number | undefined, serializedId: string | undefined): boolean {
  return liveId !== undefined && serializedId !== undefined && String(liveId) === serializedId;
}

function hydrateGridConfig(serializedConfig?: Partial<GridConfig>): GridConfig {
  return { ...GRID_CONFIG, ...(serializedConfig || {}) };
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
    let live = sequencers.find(seq => sequencerIdsMatch(seq.id, serialized.id));

    if (!live) {
      // Create new sequencer if missing
      const { wrapper } = createSequencer({
        config: {
          id: parseInt(serialized.id, 10),
          ...hydrateGridConfig(serialized.config),
        },
        instrument: serialized.instrument,
        notes: serialized.notes,
      });
      

      const zoomWrapper = wrapper.querySelector('.sequencer') as HTMLElement | null;
      if (zoomWrapper) {
        toggleZoomControls(zoomWrapper, true);
      }
    } else {
      // 🔁 Update live sequencer
      if (live.config) {
        live.config.instrument = serialized.instrument;
      }      

      const miniCanvas = live.container.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
      if (miniCanvas) {
        drawMiniContour(miniCanvas, live.notes, live.config, live.colorIndex);
      }

      const gridCtx = live.grid.gridContext;
      const selectedNotes = gridCtx.getSelectedNotes ? gridCtx.getSelectedNotes() : [];
      const selectedNote = gridCtx.getSelectedNote ? gridCtx.getSelectedNote() : null;

      const selectedPositions: NotePosition[] = selectedNotes.map((note: any) => ({
        pitch: note.pitch,
        start: note.start,
        duration: note.duration,
      }));      

      gridCtx.notes.length = 0;
      gridCtx.notes.push(...structuredClone(serialized.notes));

      if (selectedNotes.length > 0) {
        const newSelectedNotes = selectedPositions.map(pos =>
          gridCtx.notes.find((note: any) =>
            note.pitch === pos.pitch &&
            note.start === pos.start &&
            note.duration === pos.duration
          )
        ).filter(Boolean);        

        if (newSelectedNotes.length > 0) {
          gridCtx.setSelectedNotes(newSelectedNotes);

          if (selectedNote && newSelectedNotes.length === 1) {
            gridCtx.setSelectedNote(newSelectedNotes[0]);
          }
        }
      }

      live.grid.scheduleRedraw();
    }
  }

  // 🔁 Global mini-contour update
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (canvas) {
    drawGlobalMiniContour(canvas, sequencers);
  }
}
