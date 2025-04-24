// src/appState/diffEngine/types/global/changeMeasures.js

export function applySET_TOTAL_MEASURES(state, diff) {
    const newState = structuredClone(state);
    newState.totalMeasures = diff.measures;
    return newState;
  }
  
  export function createSetTotalMeasuresDiff(measures) {
    return { type: 'SET_TOTAL_MEASURES', measures };
  }
  
  export function createReverseSetTotalMeasuresDiff(measures) {
    return createSetTotalMeasuresDiff(measures);
  }
  