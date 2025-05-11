// src/components/visualizer/renderers/defaultRenderer.ts

export type VisualizerMode = 'waveform' | 'frequency' | 'spectrogram';

interface SpectrogramCanvas extends HTMLCanvasElement {
  initialized?: boolean;
}

/**
 * Starts the waveform visualizer on a given analyser node and canvas.
 */
export function startWaveformVisualizer(
  analyserNode: AnalyserNode,
  canvas: HTMLCanvasElement
): { setMode: (mode: VisualizerMode) => void } {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas 2D context not available");

  const W = canvas.width;
  const H = canvas.height;

  // Time-domain buffer
  const timeData = new Uint8Array(analyserNode.fftSize);
  // Frequency-domain buffer
  const freqData = new Uint8Array(analyserNode.frequencyBinCount);

  // Off-screen canvas for spectrogram history
  const specCanvas = document.createElement('canvas') as SpectrogramCanvas;
  specCanvas.width = W;
  specCanvas.height = H;
  const specCtx = specCanvas.getContext('2d');
  if (!specCtx) throw new Error("Offscreen canvas 2D context not available");

  let mode: VisualizerMode = 'frequency'; // default mode

  function drawWaveform(): void {
    if (!ctx) return;
    analyserNode.getByteTimeDomainData(timeData);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ffcc';
    ctx.beginPath();

    const sliceW = W / timeData.length;
    let x = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * H) / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.lineTo(W, H / 2);
    ctx.stroke();
  }

  function drawFrequencyBars(): void {
    analyserNode.getByteFrequencyData(freqData);
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(0, 0, 1, H);    // Left edge
    ctx.fillRect(W - 1, 0, 1, H); // Right edge

    const barCount = 128;
    const spacing = 2;
    const positions: number[] = [];

    for (let i = 0; i < barCount; i++) {
      positions.push((i * W) / (barCount - 1));
    }
    positions[positions.length - 1] = W - 1; // exact width

    for (let i = 0; i < barCount; i++) {
      const x = positions[i];
      const nextX = i < barCount - 1 ? positions[i + 1] : W;
      const barWidth = Math.max(1, (nextX - x) - spacing);

      const minFreq = 20;
      const maxFreq = 20000;
      const logPosition = i / (barCount - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, logPosition);

      const nyquist = 22050;
      const dataIndex = Math.min(freqData.length - 1, Math.floor((freq / nyquist) * freqData.length));
      const v = freqData[dataIndex] / 255;
      const h = Math.max(1, v * H);

      const hue = 240 - (logPosition * 240);
      ctx.fillStyle = `hsl(${hue}, ${80 + v * 20}%, ${40 + v * 40}%)`;

      ctx.fillRect(x, H - h, barWidth, h);
    }
  }

  function drawSpectrogram(): void {
    analyserNode.getByteFrequencyData(freqData);
    if (!specCtx) return;
    if (!specCanvas.initialized) {
      specCtx.fillStyle = '#000';
      specCtx.fillRect(0, 0, W, H);
      specCanvas.initialized = true;
    }

    specCtx.drawImage(specCanvas, -1, 0);

    specCtx.fillStyle = '#000';
    specCtx.fillRect(W - 1, 0, 1, H);

    const frequencyBands = 128;
    const minFreq = 20;
    const maxFreq = 20000;

    for (let i = 0; i < frequencyBands; i++) {
      const logPos = i / (frequencyBands - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, logPos);

      const nyquist = 22050;
      const dataIndex = Math.min(freqData.length - 1, Math.floor((freq / nyquist) * freqData.length));
      const amplitude = freqData[dataIndex] / 255;
      const y = H - 1 - Math.floor((i * H) / frequencyBands);

      if (amplitude < 0.05) continue;

      const r = Math.floor(amplitude * 255);
      const g = Math.floor(amplitude * (255 - (logPos * 200)));
      const b = Math.floor(amplitude * (100 + (logPos * 155)));

      specCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      specCtx.fillRect(W - 1, y, 1, 1);
    }

    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.drawImage(specCanvas, 0, 0);
  }

  function tick(): void {
    requestAnimationFrame(tick);
    switch (mode) {
      case 'frequency':
        drawFrequencyBars();
        break;
      case 'spectrogram':
        drawSpectrogram();
        break;
      case 'waveform':
      default:
        drawWaveform();
    }
  }

  tick();

  return {
    /**
     * Switch visualizer mode ('waveform', 'frequency', or 'spectrogram')
     */
    setMode(newMode: VisualizerMode): void {
      if (!['waveform', 'frequency', 'spectrogram'].includes(newMode)) return;
      mode = newMode;
      ctx.clearRect(0, 0, W, H);
      if (mode === 'spectrogram') {
        specCtx.clearRect(0, 0, W, H);
      }
    }
  };
}
