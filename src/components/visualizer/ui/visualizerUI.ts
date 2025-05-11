// src/components/visualizer/ui/visualizerUI.ts

import { h } from '@/shared/ui/domUtils.js';

/**
 * Creates the waveform visualizer canvas and mode toggle button.
 * Appends both to the #visualizer-container in the DOM.
 * 
 * @returns The container element that holds both the canvas and buttons.
 */
export function createVisualizerUI(): HTMLElement {
  const waveformCanvas = h('canvas', {
    id: 'waveform',
    width: 1260,
    height: 100,
    class: 'rounded border border-purple-800 bg-gray-900'
  });

  const modeButton = h('button', {
    id: 'visualizer-mode',
    class: 'side-button side-button-primary',
    title: 'Change visualizer mode',
    textContent: '📊'
  });

  const buttonGroup = h('div', {
    class: 'flex flex-col gap-2'
  }, modeButton);

  const wrapper = h('div', {
    class: 'flex items-start gap-2'
  }, waveformCanvas, buttonGroup);

  // Attach directly to existing anchor in DOM
  const anchor = document.getElementById('visualizer-container');
  if (anchor) {
    anchor.appendChild(wrapper);
  }

  return wrapper;
}
