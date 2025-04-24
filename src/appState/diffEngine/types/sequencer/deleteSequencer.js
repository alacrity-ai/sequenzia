import { sequencers } from '../../../../setup/sequencers.js';

export function applyDELETE_SEQUENCER(state, diff) {
  const newState = structuredClone(state);
  newState.sequencers = newState.sequencers.filter(s => s.id !== diff.id);

  const index = sequencers.findIndex(seq => seq.id === diff.id);
  if (index !== -1) {
    const seq = sequencers[index];
    seq.destroy();             // ✅ Remove from DOM
    sequencers.splice(index, 1); // ✅ Remove from live model
  }

  return newState;
}
  
  export function createDeleteSequencerDiff(id, instrument, notes = []) {
    return {
      type: 'DELETE_SEQUENCER',
      id,
      instrument,
      notes: structuredClone(notes)
    };
  }
  
  export function createReverseDeleteSequencerDiff(id, instrument, notes = []) {
    return {
      type: 'CREATE_SEQUENCER',
      id,
      instrument,
      notes: structuredClone(notes)
    };
  }
  