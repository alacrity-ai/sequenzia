// src/appState/resyncFromState.ts

import { getAppState } from './appState.js';
import { updateTempo, updateTimeSignature, updateTotalMeasures } from '../sequencer/transport.js';
import { createSequencer, toggleZoomControls, sequencers } from '../setup/sequencers.js';
import { drawGlobalMiniContour, drawMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { AppState, SequencerState } from './interfaces/AppState.js';
import { NotePosition } from '../sequencer/interfaces/Grid.js';
import { GridConfig } from '../sequencer/interfaces/GridConfig.js';
import { engine as playbackEngine } from '../main.js';

interface SerializedSequencer extends SequencerState {
  config?: Partial<GridConfig>; // optional loose config, typed better
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

      const { wrapper } = createSequencer(initialState);

      const zoomWrapper = wrapper.querySelector('.sequencer') as HTMLElement | null;
      if (zoomWrapper) {
        toggleZoomControls(zoomWrapper, true);
      }
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

      const miniCanvas = live.container?.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
      if (miniCanvas) {
        drawMiniContour(miniCanvas, live.notes, live.config, live.colorIndex);
      }

      const gridCtx = live.grid?.gridContext;
      if (gridCtx) {
        const selectedNotes = gridCtx.getSelectedNotes ? gridCtx.getSelectedNotes() : [];
        const selectedNote = gridCtx.getSelectedNote ? gridCtx.getSelectedNote() : null;

        const selectedPositions: NotePosition[] = selectedNotes.map((note: any) => ({
          pitch: note.pitch,
          start: note.start,
          duration: note.duration,
          velocity: note.velocity,
        }));

        gridCtx.notes.length = 0;
        gridCtx.notes.push(...structuredClone(serialized.notes));

        if (selectedNotes.length > 0) {
          const newSelectedNotes = selectedPositions.map(pos =>
            gridCtx.notes.find((note: any) =>
              note.pitch === pos.pitch &&
              note.start === pos.start &&
              note.duration === pos.duration &&
              note.velocity === pos.velocity
            )
          ).filter(Boolean);

          if (newSelectedNotes.length > 0) {
            gridCtx.setSelectedNotes(newSelectedNotes as any);

            if (selectedNote && newSelectedNotes.length === 1) {
              gridCtx.setSelectedNote(newSelectedNotes[0] as any);
            }
          }
        }

        if (playbackEngine?.isActive()) {
          const startAt = playbackEngine.getStartTime();
          const startBeat = playbackEngine.getStartBeat();
          void live.reschedulePlayback(startAt, startBeat);
        }
        live.grid?.scheduleRedraw();
      }
    }
  }

  // 🔁 Global mini-contour update
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (canvas) {
    drawGlobalMiniContour(canvas, sequencers);
  }
}
