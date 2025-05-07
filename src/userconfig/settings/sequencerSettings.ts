// js/userconfig/settings/sequencerSettings.js

import { getUserConfig, updateUserConfig } from './userConfigStore.js';
import { getSequencers } from '../../sequencer/factories/SequencerFactory.js';
import { UserConfig } from '../interfaces/UserConfig.js';

export const GRID_COLOR_SCHEMES: string[] = [
  'Darkroom',
  'Seashell',
  'Cyberpunk',
  'Classic Blue',
  'Midnight'
];

export const NOTE_COLOR_SCHEMES: string[] = [
  'Track Color',
  'Note Velocity',
  'Pitch Class Contrast',
  'Scriabin',
  'Octave Bands'
];

export function initSequencerSettings(): void {
  const gridSelect = document.getElementById('grid-color-select') as HTMLSelectElement | null;
  const noteSelect = document.getElementById('note-color-select') as HTMLSelectElement | null;

  if (!gridSelect || !noteSelect) return;

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
  const config: UserConfig = getUserConfig();
  gridSelect.value = config.theme.gridColorScheme;
  noteSelect.value = config.theme.noteColorScheme;

  // Listeners
  gridSelect.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    updateUserConfig({ theme: { gridColorScheme: target.value } });
    getSequencers().forEach(seq => seq.matrix?.requestRedraw());
  });
  
  noteSelect.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    updateUserConfig({ theme: { noteColorScheme: target.value } });
    getSequencers().forEach(seq => seq.matrix?.requestRedraw());
  });
  
}
