let currentAppState = {
    tempo: 120,
    timeSignature: [4, 4],
    totalMeasures: 8,
    sequencers: [] // Each: { id, instrument, notes: [...] }
  };
  
  export function getAppState() {
    return currentAppState;
  }
  
  export function setAppState(newState) {
    currentAppState = structuredClone(newState);
  }
  