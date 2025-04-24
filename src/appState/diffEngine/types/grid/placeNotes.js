// src/appState/diffEngine/types/grid/placeNotes.js

import { drawGlobalMiniContour } from "../../../../sequencer/mini-contour";
import { sequencers } from "../../../../setup/sequencers";

export function applyPLACE_NOTES(state, diff) {
    const newState = structuredClone(state);
    const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
    if (!seq) return state;
  
    seq.notes.push(...diff.notes);

    // Refresh global mini contour after note placement
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) {
      drawGlobalMiniContour(globalMiniCanvas, sequencers);
    }

    return newState;
}

export function createPlaceNotesDiff(sequencerId, notes) {
    return {
      type: 'PLACE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
}

export function createReversePlaceNotesDiff(sequencerId, notes) {
    return {
      type: 'DELETE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
}
  
