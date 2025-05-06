// src/sequencer/utils/snappedBeat.ts

export function getSnappedBeat(beat: number, config: { snapResolution: number; isTripletMode: boolean }): number {
    const base = config.snapResolution || 0.25;
    const snapStep = config.isTripletMode ? base * (2 / 3) : base;
    return Math.round(beat / snapStep) * snapStep;
}