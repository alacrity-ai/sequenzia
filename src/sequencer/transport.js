let animationId = null;
let beatDuration = 500;
let startTime = null;
let loop = false;
let endBeat = Infinity;
let listeners = [];
let onEndCallback = null;
let currentBeat = 0;

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

export function getCurrentBeat() {
  return currentBeat;
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
