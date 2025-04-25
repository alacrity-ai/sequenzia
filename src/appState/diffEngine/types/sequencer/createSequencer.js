// src/appState/diffEngine/types/sequencer/createSequencer.js

import { createSequencer, sequencers, toggleZoomControls } from '../../../../setup/sequencers.js';

export function applyCREATE_SEQUENCER(state, diff) {
  const newState = structuredClone(state);

  newState.sequencers.push({
    id: diff.id,
    instrument: diff.instrument,
    notes: diff.notes || []
  });

  const existing = sequencers.find(s => s.id === diff.id);
  if (!existing) {
    const { seq, wrapper } = createSequencer({
      config: {
        id: diff.id,
        ...diff.config
      },
      notes: diff.notes || [],
      instrument: diff.instrument
    });
    toggleZoomControls(wrapper, true);
  }

  return newState;
}

  
  export function createCreateSequencerDiff(id, instrument) {
    return {
      type: 'CREATE_SEQUENCER',
      id,
      instrument
    };
  }
  
  export function createReverseCreateSequencerDiff(id) {
    return {
      type: 'DELETE_SEQUENCER',
      id
    };
  }
  
