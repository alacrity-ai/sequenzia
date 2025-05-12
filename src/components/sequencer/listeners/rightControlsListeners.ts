// src/components/sequencer/listeners/rightControlsListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { RightControlsUI } from '../ui/topBar/rightControls.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

import { getOverlaysController } from '@/components/overlays/overlaysController.js';
import { recordDiff } from '@/appState/appState.js';
import {
  createDeleteSequencerDiff,
  createReverseDeleteSequencerDiff
} from '@/appState/diffEngine/types/sequencer/deleteSequencer.js';

export function attachRightControlsListeners(
  ui: RightControlsUI,
  sequencer: Sequencer,
  matrixContainer: HTMLElement,
  setCollapsed: (collapsed: boolean) => boolean,
  isCollapsed: () => boolean
): ListenerAttachment {
  const { muteBtn, soloBtn, collapseBtn, deleteBtn } = ui;

  const body = matrixContainer;

  const updateButtonStates = () => {
    muteBtn.classList.toggle('side-button-activated', sequencer.mute);
    soloBtn.classList.toggle('side-button-activated', sequencer.solo);
  };

  const handleMuteClick = () => {
    sequencer.toggleMute();
    updateButtonStates();
  };

  const handleSoloClick = () => {
    sequencer.toggleSolo();
    updateButtonStates();
  };

  const handleCollapseClick = () => {
    setCollapsed(!isCollapsed());
  };

  const handleDeleteClick = () => {
    getOverlaysController().showDeleteConfirmModal(
      () => {
        // Confirm callback: perform deletion logic.
        recordDiff(
          createDeleteSequencerDiff(
            sequencer.id,
            sequencer.instrumentName,
            sequencer.notes,
            sequencer.volume,
            sequencer.pan
          ),
          createReverseDeleteSequencerDiff(
            sequencer.id,
            sequencer.instrumentName,
            sequencer.notes,
            sequencer.volume,
            sequencer.pan
          )
        );
        sequencer.destroy();
      },
      () => {
        // Cancel callback: no-op or logging if desired.
        console.log('Delete cancelled');
      }
    );
  };

  muteBtn.addEventListener('click', handleMuteClick);
  soloBtn.addEventListener('click', handleSoloClick);
  collapseBtn.addEventListener('click', handleCollapseClick);
  deleteBtn.addEventListener('click', handleDeleteClick);

  const refreshUI = () => {
    updateButtonStates();
  };

  return {
    detach: () => {
      muteBtn.removeEventListener('click', handleMuteClick);
      soloBtn.removeEventListener('click', handleSoloClick);
      collapseBtn.removeEventListener('click', handleCollapseClick);
      deleteBtn.removeEventListener('click', handleDeleteClick);
    },
    refreshUI
  };
}
