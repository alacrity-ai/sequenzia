// src/sequencer/grid/interaction/velocity/velocityModeHandlers.ts

import { getActiveSelection } from '../../../../setup/stores/selectionTracker.js';
import { showVelocityModal } from './velocityModeMenu.js';
import { showErrorModal } from '../../../../global/errorGeneric.js';

function onVelocityModeButtonClick(): void {
  const selection = getActiveSelection();

  if (!selection || selection.selectedNotes.length === 0) {
    showErrorModal('No notes selected. Please select notes before adjusting velocity.');
    return;
  }

  // We may want to pass context info to the modal later
  showVelocityModal(selection.selectedNotes);
}

export function registerVelocityModeHandlers(): void {
  const button = document.getElementById('velocity-mode-menu-btn');
  if (!button) {
    console.warn('[VelocityMode] Could not find button with id "velocity-mode-menu-btn".');
    return;
  }

  button.addEventListener('click', onVelocityModeButtonClick);
}
