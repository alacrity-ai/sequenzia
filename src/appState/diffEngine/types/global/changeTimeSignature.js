// src/appState/diffEngine/types/global/changeTimeSignature.js

export function applySET_TIME_SIGNATURE(state, diff) {
    const newState = structuredClone(state);
    newState.timeSignature = [diff.beats, 4];
    return newState;
  }
  
  export function createSetTimeSignatureDiff(beats) {
    return { type: 'SET_TIME_SIGNATURE', beats };
  }
  
  export function createReverseSetTimeSignatureDiff(beats) {
    return createSetTimeSignatureDiff(beats);
  }
  