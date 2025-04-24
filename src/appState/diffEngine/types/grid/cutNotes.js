// src/appState/diffEngine/types/grid/cutNotes.js

export function applyCUT_NOTES(state, diff) {
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
  
    return newState;
  }
  
  export function createCutNotesDiff(sequencerId, notes) {
    return {
      type: 'CUT_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  
  export function createReverseCutNotesDiff(sequencerId, notes) {
    return {
      type: 'PLACE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  