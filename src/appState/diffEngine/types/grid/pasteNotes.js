// src/appState/diffEngine/types/grid/pasteNotes.js

export function applyPASTE_NOTES(state, diff) {
    const newState = structuredClone(state);
    const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
    if (!seq) return state;
  
    seq.notes.push(...diff.notes);
    return newState;
  }
  
  export function createPasteNotesDiff(sequencerId, notes) {
    return {
      type: 'PASTE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  
  export function createReversePasteNotesDiff(sequencerId, notes) {
    return {
      type: 'DELETE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  