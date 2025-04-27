  export function getRawBeatFromX(x, getCellWidth) {
    return x / getCellWidth();
  }
  
  export function getSnappedBeat(beat, config) {
    let base = config.snapResolution || 0.25;
    let snapStep = config.isTripletMode ? base * (2 / 3) : base;
    return Math.round(beat / snapStep) * snapStep;
  }
  
  export function getSnappedBeatFromX(x, config, getCellWidth) {
    const rawBeat = getRawBeatFromX(x, getCellWidth);
    return getSnappedBeat(rawBeat, config);
  }
  