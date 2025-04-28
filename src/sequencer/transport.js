// src/sequencer/transport.js

import { getSequencers } from '../setup/sequencers.js';
import { recordDiff } from '../appState/appState.js';
import { createChangeTempoDiff, createReverseChangeTempoDiff } from '../appState/diffEngine/types/global/changeTempo.js';
import { createSetTimeSignatureDiff, createReverseSetTimeSignatureDiff } from '../appState/diffEngine/types/global/changeTimeSignature.js';
import { createSetTotalMeasuresDiff, createReverseSetTotalMeasuresDiff } from '../appState/diffEngine/types/global/changeMeasures.js';
import { config } from '../setup/sequencers.js';

let animationId = null;
let beatDuration = 500;
let startTime = null;
let loop = false;
let endBeat = Infinity;
let listeners = [];
let onEndCallback = null;
let currentBeat = 0;
let beatsPerMeasure = 4;
let totalMeasures = 8;

export function onBeatUpdate(listener) {
    listeners.push(listener);
    return () => {
      const i = listeners.indexOf(listener);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

export function clearBeatListeners() {
  listeners = [];
}

export function setCurrentBeat(beat) {
  currentBeat = beat;
}

export function getTotalBeats() {
  return getTotalMeasures() * getTimeSignature();
}

export function getCurrentBeat() {
  return currentBeat;
}

export function updateTempo(bpm, record = true) {
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
    const currentBeat = (now - startTime) / beatDuration;
    beatDuration = 60 / bpm * 1000;
    startTime = now - (currentBeat * beatDuration);
  } else {
    beatDuration = 60 / bpm * 1000;
  }

  const tempoInput = document.getElementById('tempo-input');
  if (tempoInput && tempoInput.value !== String(bpm)) {
    tempoInput.value = bpm;
  }
}

export function getTempo() {
  return 60 / (beatDuration / 1000);
}

export function updateTimeSignature(beats, record = true) {
  if (record) {
    const prev = getTimeSignature();
    recordDiff(
      createSetTimeSignatureDiff(beats),
      createReverseSetTimeSignatureDiff(prev)
    );
    return;
  }

  beatsPerMeasure = beats;

  const beatsInput = document.getElementById('beats-per-measure-input');
  if (beatsInput && beatsInput.value !== String(beats)) {
    beatsInput.value = beats;
  }

  getSequencers().forEach(seq => {
    if (seq.grid?.resizeAndRedraw) {
      seq.grid.resizeAndRedraw();
    } else {
      seq.grid?.scheduleRedraw();
    }
  });
}

export function getTimeSignature() {
  return beatsPerMeasure;
}

export function updateTotalMeasures(measures, record = true) {
  if (record) {
    const prev = getTotalMeasures();
    recordDiff(
      createSetTotalMeasuresDiff(measures),
      createReverseSetTotalMeasuresDiff(prev)
    );
    return;
  }

  totalMeasures = measures;

  const measuresInput = document.getElementById('measures-input');
  if (measuresInput && measuresInput.value !== String(measures)) {
    measuresInput.value = measures;
  }

  getSequencers().forEach(seq => {
    seq.grid?.scheduleRedraw();
  });
}
export function getTotalMeasures() {
  return totalMeasures;
}

export function onTransportEnd(callback) {
  onEndCallback = callback;
}

export function getSnapResolution() {
  return config.snapResolution;
}

export function startTransport(bpm, opts = {}) {
  beatDuration = 60 / bpm * 1000;
  loop = opts.loop ?? false;
  endBeat = opts.endBeat ?? Infinity;
  const startBeat = opts.startBeat ?? 0;
  startTime = performance.now() - startBeat * beatDuration;

  const onLoop = opts.onLoop;

  function tick(now) {
    const elapsedMs = now - startTime;
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



export function stopTransport() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  clearBeatListeners();

  if (onEndCallback) {
    onEndCallback();
    onEndCallback = null; // Reset after firing
  }
}

export function isTransportRunning() {
  return animationId !== null;
}

export function pauseTransport() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
}

export function resumeTransport() {
  if (animationId) return;

  const resumeStartTime = performance.now() - getCurrentBeat() * beatDuration;

  function tick(now) {
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
