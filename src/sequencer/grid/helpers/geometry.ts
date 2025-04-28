// src/sequencer/grid/helpers/geometry.ts

export function getRawBeatFromX(x: number, getCellWidth: () => number): number {
  return x / getCellWidth();
}

export function getSnappedBeat(beat: number, config: { snapResolution: number; isTripletMode: boolean }): number {
  const base = config.snapResolution || 0.25;
  const snapStep = config.isTripletMode ? base * (2 / 3) : base;
  return Math.round(beat / snapStep) * snapStep;
}

export function getSnappedBeatFromX(x: number, config: { snapResolution: number; isTripletMode: boolean }, getCellWidth: () => number): number {
  const rawBeat = getRawBeatFromX(x, getCellWidth);
  return getSnappedBeat(rawBeat, config);
}
