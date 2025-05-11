// src/components/visualizer/listeners/visualizerListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import { startWaveformVisualizer } from '@/components/visualizer/renderers/defaultRenderer.js';
import { getAnalyserNode } from '@/sounds/audio/audio.js';

type VisualizerMode = 'waveform' | 'frequency' | 'spectrogram';

/**
 * Attaches listeners and control logic to the visualizer canvas and mode toggle.
 */
export function attachVisualizerListeners(container: HTMLElement): ListenerAttachment {
  const canvas = container.querySelector('#waveform') as HTMLCanvasElement | null;
  const button = container.querySelector('#visualizer-mode') as HTMLButtonElement | null;

  if (!canvas || !button) {
    console.warn('Visualizer setup failed: missing canvas or button');
    return { detach: () => {}, refreshUI: () => {} };
  }

  const visualizer = startWaveformVisualizer(getAnalyserNode(), canvas);

  const modes: { name: VisualizerMode; emoji: string }[] = [
    { name: 'waveform', emoji: '🌊' },
    { name: 'frequency', emoji: '📊' },
    { name: 'spectrogram', emoji: '🌈' },
  ];

  let modeIndex = 0;

  function switchMode(): void {
    if (!button) return;
    modeIndex = (modeIndex + 1) % modes.length;
    const { name, emoji } = modes[modeIndex];
    visualizer.setMode(name);
    button.textContent = emoji;
    button.title = `Mode: ${name}`;
  }

  button.addEventListener('click', switchMode);
  switchMode(); // Set initial mode

  return {
    detach: () => {
      button.removeEventListener('click', switchMode);
    },
    refreshUI: () => {
      button.textContent = modes[modeIndex].emoji;
      button.title = `Mode: ${modes[modeIndex].name}`;
    }
  };
}
