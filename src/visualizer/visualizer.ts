// src/setup/visualizer.js

import { startWaveformVisualizer } from './renderers/defaultRenderer.js';
import { getAnalyserNode } from '../sounds/audio/audio.js';

type VisualizerMode = 'waveform' | 'frequency' | 'spectrogram';

interface VisualizerController {
  setMode: (mode: VisualizerMode) => void;
}

export function setupVisualizer(canvas: HTMLCanvasElement, button: HTMLButtonElement): void {
  const visualizer: VisualizerController = startWaveformVisualizer(getAnalyserNode(), canvas);

  const modes: { name: VisualizerMode; emoji: string }[] = [
    { name: 'waveform', emoji: '🌊' },
    { name: 'frequency', emoji: '📊' },
    { name: 'spectrogram', emoji: '🌈' },
  ];

  let modeIndex = 0;

  function switchMode(): void {
    modeIndex = (modeIndex + 1) % modes.length;
    const { name, emoji } = modes[modeIndex];
    visualizer.setMode(name);
    button.textContent = emoji;
    button.title = `Mode: ${name}`;
  }

  button.addEventListener('click', switchMode);
  switchMode(); // Set initial mode immediately
}
