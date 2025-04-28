// src/sequencer/transport.ts

import { getSequencers } from '../setup/sequencers.js';
import { recordDiff } from '../appState/appState.js';
import { createChangeTempoDiff, createReverseChangeTempoDiff } from '../appState/diffEngine/types/global/changeTempo.js';
import { createSetTimeSignatureDiff, createReverseSetTimeSignatureDiff } from '../appState/diffEngine/types/global/changeTimeSignature.js';
import { createSetTotalMeasuresDiff, createReverseSetTotalMeasuresDiff } from '../appState/diffEngine/types/global/changeMeasures.js';
import { GRID_CONFIG as config } from './grid/helpers/constants.js';

let animationId: number | null = null;
let beatDuration: number = 500; // ms per beat
let startTime: number | null = null;
let loop: boolean = false;
let endBeat: number = Infinity;
let listeners: Array<(beat: number) => void> = [];
let onEndCallback: (() => void) | null = null;
let currentBeat: number = 0;
let beatsPerMeasure: number = 4;
let totalMeasures: number = 8;

interface TransportOptions {
  loop?: boolean;
  endBeat?: number;
  startBeat?: number;
  onLoop?: () => void;
}

export function onBeatUpdate(listener: (beat: number) => void): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}

export function clearBeatListeners(): void {
  listeners = [];
}

export function setCurrentBeat(beat: number): void {
  currentBeat = beat;
}

export function getCurrentBeat(): number {
  return currentBeat;
}

export function getTotalBeats(): number {
  return getTotalMeasures() * getTimeSignature();
}

export function updateTempo(bpm: number, record: boolean = true): void {
  if (record) {
    const prevBpm = getTempo();
    recordDiff(
      createChangeTempoDiff(bpm),
      createReverseChangeTempoDiff(prevBpm)
    );
    return;
  }

  if (isTransportRunning()) {
    const now = performance.now();
    const currentBeat = (now - (startTime ?? now)) / beatDuration;
    beatDuration = (60 / bpm) * 1000;
    startTime = now - (currentBeat * beatDuration);
  } else {
    beatDuration = (60 / bpm) * 1000;
  }

  const tempoInput = document.getElementById('tempo-input') as HTMLInputElement | null;
  if (tempoInput && tempoInput.value !== String(bpm)) {
    tempoInput.value = String(bpm);
  }
}

export function getTempo(): number {
  return 60 / (beatDuration / 1000);
}

export function updateTimeSignature(beats: number, record: boolean = true): void {
  if (record) {
    const prev = getTimeSignature();
    recordDiff(
      createSetTimeSignatureDiff(beats),
      createReverseSetTimeSignatureDiff(prev)
    );
    return;
  }

  beatsPerMeasure = beats;

  const beatsInput = document.getElementById('beats-per-measure-input') as HTMLInputElement | null;
  if (beatsInput && beatsInput.value !== String(beats)) {
    beatsInput.value = String(beats);
  }

  getSequencers().forEach(seq => {
    if (seq.grid?.resizeAndRedraw) {
      seq.grid.resizeAndRedraw();
    } else {
      seq.grid?.scheduleRedraw();
    }
  });
}

export function getTimeSignature(): number {
  return beatsPerMeasure;
}

export function updateTotalMeasures(measures: number, record: boolean = true): void {
  if (record) {
    const prev = getTotalMeasures();
    recordDiff(
      createSetTotalMeasuresDiff(measures),
      createReverseSetTotalMeasuresDiff(prev)
    );
    return;
  }

  totalMeasures = measures;

  const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
  if (measuresInput && measuresInput.value !== String(measures)) {
    measuresInput.value = String(measures);
  }

  getSequencers().forEach(seq => {
    seq.grid?.scheduleRedraw();
  });
}

export function getTotalMeasures(): number {
  return totalMeasures;
}

export function setLoopEnabled(enabled: boolean): void {
  loop = enabled;
}

export function onTransportEnd(callback: () => void): void {
  onEndCallback = callback;
}

export function getSnapResolution(): number {
  return config.snapResolution;
}

export function startTransport(bpm: number, opts: TransportOptions = {}): void {
  beatDuration = (60 / bpm) * 1000;
  loop = opts.loop ?? false;
  endBeat = opts.endBeat ?? Infinity;
  const startBeat = opts.startBeat ?? 0;
  startTime = performance.now() - startBeat * beatDuration;

  const onLoop = opts.onLoop;

  function tick(now: number): void {
    const elapsedMs = now - (startTime ?? now);
    const beat = elapsedMs / beatDuration;

    setCurrentBeat(beat);
    listeners.forEach(fn => fn(beat));

    if (beat >= endBeat) {
      if (loop) {
        startTime = performance.now();
        setCurrentBeat(0);
        if (onLoop) onLoop();
      } else {
        stopTransport();
        return;
      }
    }

    animationId = requestAnimationFrame(tick);
  }

  animationId = requestAnimationFrame(tick);
}

export function stopTransport(): void {
  if (animationId !== null) cancelAnimationFrame(animationId);
  animationId = null;
  clearBeatListeners();

  if (onEndCallback) {
    onEndCallback();
    onEndCallback = null;
  }
}

export function isTransportRunning(): boolean {
  return animationId !== null;
}

export function pauseTransport(): void {
  if (animationId !== null) cancelAnimationFrame(animationId);
  animationId = null;
}

export function resumeTransport(): void {
  if (animationId !== null) return;

  const resumeStartTime = performance.now() - getCurrentBeat() * beatDuration;

  function tick(now: number): void {
    const elapsedMs = now - resumeStartTime;
    const beat = elapsedMs / beatDuration;

    setCurrentBeat(beat);
    listeners.forEach(fn => fn(beat));

    if (beat >= endBeat) {
      if (loop) {
        startTime = performance.now();
        setCurrentBeat(0);
      } else {
        stopTransport();
        return;
      }
    }

    animationId = requestAnimationFrame(tick);
  }

  animationId = requestAnimationFrame(tick);
}
