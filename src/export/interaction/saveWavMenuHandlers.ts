// src/export/interaction/saveWavMenuHandlers.ts

import { applySaveWavOptions, cancelSaveWavOptions } from './saveWavMenu.js';

export function registerSaveWavMenuHandlers(): void {
  const applyBtn = document.getElementById('save-wav-options-apply-btn');
  const cancelBtn = document.getElementById('save-wav-options-cancel-btn');

  if (applyBtn) applyBtn.addEventListener('click', applySaveWavOptions);
  if (cancelBtn) cancelBtn.addEventListener('click', cancelSaveWavOptions);
}
