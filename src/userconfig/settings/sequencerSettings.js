// js/userconfig/settings/sequencerSettings.js

import { getUserConfig, updateUserConfig } from './userConfig.js';
import { getSequencers } from '../../setup/sequencers.js';

export const GRID_COLOR_SCHEMES = ['Darkroom', 'Seashell', 'Cyberpunk', 'Classic Blue', 'Midnight'];
export const NOTE_COLOR_SCHEMES = [
  'Track Color',
  'Pitch Class Contrast',
  'Scriabin',
  'Octave Bands'
];

export function initSequencerSettings() {
  const gridSelect = document.getElementById('grid-color-select');
  const noteSelect = document.getElementById('note-color-select');

  // Populate dropdowns
  for (const scheme of GRID_COLOR_SCHEMES) {
    const option = document.createElement('option');
    option.value = scheme;
    option.textContent = scheme;
    gridSelect.appendChild(option);
  }

  for (const scheme of NOTE_COLOR_SCHEMES) {
    const option = document.createElement('option');
    option.value = scheme;
    option.textContent = scheme;
    noteSelect.appendChild(option);
  }

  // Set initial values
  const config = getUserConfig();
  gridSelect.value = config.gridColorScheme;
  noteSelect.value = config.noteColorScheme;

  // Listeners (stub behavior for now)
  gridSelect.addEventListener('change', (e) => {
    updateUserConfig({ gridColorScheme: e.target.value });
    // TODO: Trigger grid re-render with new theme
    getSequencers().forEach(seq => seq.grid?.scheduleRedraw());
  });

  noteSelect.addEventListener('change', (e) => {
    updateUserConfig({ noteColorScheme: e.target.value });
    // TODO: Trigger note re-coloring
    getSequencers().forEach(seq => seq.grid?.scheduleRedraw());
  });
}
