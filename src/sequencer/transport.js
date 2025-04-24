import { getSequencers } from '../setup/sequencers.js';

let animationId = null;
let beatDuration = 500;
let startTime = null;
let loop = false;
let endBeat = Infinity;
let listeners = [];
let onEndCallback = null;
let currentBeat = 0;
let beatsPerMeasure = 4; // default fallback
let totalMeasures = 8; // default fallback

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

export function updateTempo(bpm) {
  if (isTransportRunning()) {
    // Calculate current beat position before tempo change
    const now = performance.now();
    const currentBeat = (now - startTime) / beatDuration;
    
    // Update beat duration
    beatDuration = 60 / bpm * 1000;
    
    // Adjust start time to maintain current beat position
    startTime = now - (currentBeat * beatDuration);
  } else {
    // If transport isn't running, just update the duration
    beatDuration = 60 / bpm * 1000;
  }

  // Update UI if needed
  const tempoInput = document.getElementById('tempo-input');
  if (tempoInput && tempoInput.value !== String(bpm)) {
    tempoInput.value = bpm;
  }
}

export function getTempo() {
  return 60 / (beatDuration / 1000);
}

export function updateTimeSignature(newBeatsPerMeasure) {
  beatsPerMeasure = newBeatsPerMeasure;

  const beatsInput = document.getElementById('beats-per-measure-input');
  if (beatsInput && beatsInput.value !== String(newBeatsPerMeasure)) {
    beatsInput.value = newBeatsPerMeasure;
  }

  // Redraw all sequencers and resize canvas
  getSequencers().forEach(seq => {
    if (seq.grid?.resizeAndRedraw) {
      seq.grid.resizeAndRedraw(); // 🟢 Ensures canvas width matches new totalBeats
    } else {
      seq.grid?.scheduleRedraw();
    }
  });
}

export function getTimeSignature() {
  return beatsPerMeasure;
}

export function updateTotalMeasures(newTotalMeasures) {
  totalMeasures = newTotalMeasures;

  const measuresInput = document.getElementById('measures-input');
  if (measuresInput && measuresInput.value !== String(newTotalMeasures)) {
    measuresInput.value = newTotalMeasures;
  }

  // Redraw all sequencers
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
        if (onLoop) onLoop(); // ✅ 🔁 Notifies all subscribers
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
  // listeners and currentBeat are preserved
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
