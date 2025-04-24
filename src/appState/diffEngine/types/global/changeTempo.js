// src/appState/diffEngine/types/global/changeTempo.js

export function applyCHANGE_TEMPO(state, diff) {
    const newState = structuredClone(state);
    newState.tempo = diff.bpm;
    return newState;
  }
  
  export function createChangeTempoDiff(bpm) {
    return { type: 'CHANGE_TEMPO', bpm };
  }
  
  export function createReverseChangeTempoDiff(bpm) {
    return createChangeTempoDiff(bpm);
  }
  