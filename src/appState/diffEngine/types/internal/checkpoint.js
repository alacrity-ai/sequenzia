// src/appState/diffEngine/types/internal/checkpoint.js

export function applyCHECKPOINT(state, diff) {
    return structuredClone(state); // Does not mutate state
  }
  
  export function createCheckpointDiff(label = '') {
    return {
      type: 'CHECKPOINT',
      label
    };
  }
  
  export function createReverseCheckpointDiff(label = '') {
    // Checkpoints are non-reversible — return another checkpoint to maintain shape
    return createCheckpointDiff(label);
  }
  