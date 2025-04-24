export function applyMOVE_NOTES(state, diff) {
    const newState = structuredClone(state);
    const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
    if (!seq) return state;
  
    const { from, to } = diff;
  
    // Match and apply new pitch/start
    for (let i = 0; i < from.length; i++) {
      const original = from[i];
      const updated = to[i];
  
      const index = seq.notes.findIndex(
        n =>
          n.pitch === original.pitch &&
          n.start === original.start &&
          n.duration === original.duration
      );
  
      if (index !== -1) {
        seq.notes[index].pitch = updated.pitch;
        seq.notes[index].start = updated.start;
      }
    }
  
    return newState;
  }
  
  export function createMoveNotesDiff(sequencerId, from, to) {
    return {
      type: 'MOVE_NOTES',
      sequencerId,
      from: structuredClone(from),
      to: structuredClone(to)
    };
  }
  
  export function createReverseMoveNotesDiff(sequencerId, from, to) {
    // Just flip them
    return createMoveNotesDiff(sequencerId, to, from);
  }
  