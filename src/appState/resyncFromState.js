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
  updateTempo(state.tempo, false);
  updateTimeSignature(state.timeSignature[0], false);
  updateTotalMeasures(state.totalMeasures, false);

  // Tell each sequencer to update its grid width based on new total measures
  for (const seq of sequencers) {
    seq.updateTotalMeasures(state.totalMeasures);
  }

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
    } else {
      // 🔁 Otherwise, update live sequencer's state
      live.config.instrument = serialized.instrument;

      // ✅ REDRAW MINI CONTOUR if it exists (e.g., collapsed track)
      const miniCanvas = live.container.querySelector('canvas.mini-contour');
      if (miniCanvas) {
        drawMiniContour(miniCanvas, live.notes, live.config, live.colorIndex);
      }

      // Store currently selected notes before updating
      const gridCtx = live.grid.gridContext;
      const selectedNotes = gridCtx.getSelectedNotes ? gridCtx.getSelectedNotes() : [];
      const selectedNote = gridCtx.getSelectedNote ? gridCtx.getSelectedNote() : null;
      
      // Keep track of selected note positions to find them after the update
      const selectedPositions = selectedNotes.map(note => ({
        pitch: note.pitch,
        start: note.start,
        duration: note.duration
      }));
      
      // Update notes
      gridCtx.notes.length = 0;
      gridCtx.notes.push(...structuredClone(serialized.notes));
      
      // Restore selection by finding the updated note objects with matching positions
      if (selectedNotes.length > 0) {
        const newSelectedNotes = selectedPositions.map(pos => {
          return gridCtx.notes.find(note => 
            note.pitch === pos.pitch && 
            note.start === pos.start && 
            note.duration === pos.duration
          );
        }).filter(Boolean); // Remove any null/undefined values
        
        if (newSelectedNotes.length > 0) {
          gridCtx.setSelectedNotes(newSelectedNotes);
          
          // If there was a single selected note, restore that as well
          if (selectedNote && newSelectedNotes.length === 1) {
            gridCtx.setSelectedNote(newSelectedNotes[0]);
          }
        }
      }
      
      live.grid.scheduleRedraw();
    }
  }
  
  // 🔁 Global mini-contour update
  const canvas = document.getElementById('global-mini-contour');
  if (canvas) {
    drawGlobalMiniContour(canvas, sequencers);
  }
}