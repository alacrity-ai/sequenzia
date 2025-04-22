export function applyPLACE_NOTES(state, diff) {
    const newState = structuredClone(state);
    const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
    if (!seq) return state;
  
    seq.notes.push(...diff.notes);
    return newState;
  }
  
  export function createPlaceNotesDiff(sequencerId, notes) {
    return {
      type: 'PLACE_NOTES',
      sequencerId,
      notes: structuredClone(notes)
    };
  }
  