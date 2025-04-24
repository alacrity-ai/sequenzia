import { drawGlobalMiniContour } from "../../../../sequencer/mini-contour";
import { sequencers } from "../../../../setup/sequencers";
  
  export function applyDELETE_NOTES(state, diff) {
    const newState = structuredClone(state);
    const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
    if (!seq) return state;
  
    const toDelete = new Set(diff.notes.map(n =>
      `${n.pitch}|${n.start}|${n.duration}`
    ));
  
    seq.notes = seq.notes.filter(n => {
      const key = `${n.pitch}|${n.start}|${n.duration}`;
      return !toDelete.has(key);
    });

    // Refresh global mini contour after note deletion
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) {
      drawGlobalMiniContour(globalMiniCanvas, sequencers);
    }
  
    return newState;
  }
  
  export function createDeleteNotesDiff(sequencerId, notes) {
    return {
      type: 'DELETE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  
  export function createReverseDeleteNotesDiff(sequencerId, notes) {
    return {
      type: 'PLACE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  
