import { startWaveformVisualizer } from '../visualizer.js';
import { analyserNode } from '../audio/audio.js';

export function setupVisualizer(canvas, button) {
  const visualizer = startWaveformVisualizer(analyserNode, canvas);

  const modes = [
    { name: 'waveform', emoji: '🌊' },
    { name: 'frequency', emoji: '📊' },
    { name: 'spectrogram', emoji: '🌈' }
  ];

  let modeIndex = 0;

  function switchMode() {
    modeIndex = (modeIndex + 1) % modes.length;
    const { name, emoji } = modes[modeIndex];
    visualizer.setMode(name);
    button.textContent = emoji;
    button.title = `Mode: ${name}`;
  }

  button.addEventListener('click', switchMode);
  switchMode(); // set initial mode
}
