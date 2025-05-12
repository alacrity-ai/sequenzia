import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { RightControlsUI } from '../ui/topBar/rightControls.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';
import type Sequencer from '@/components/sequencer/sequencer.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

import { recordDiff } from '@/appState/appState.js';
import {
  createDeleteSequencerDiff,
  createReverseDeleteSequencerDiff
} from '@/appState/diffEngine/types/sequencer/deleteSequencer.js';

export function attachRightControlsListeners(
  ui: RightControlsUI,
  sequencer: Sequencer,
  matrixContainer: HTMLElement,
  gripHandleContainer: HTMLElement,
  setCollapsed: (collapsed: boolean) => boolean,
  isCollapsed: () => boolean
): ListenerAttachment {
  const { muteBtn, soloBtn, collapseBtn, deleteBtn } = ui;

  const collapseIcon = collapseBtn.querySelector('img');
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
    const collapsed = setCollapsed(!isCollapsed());

    // Update icon image (up if collapsed, down if expanded)
    if (collapseIcon) {
      const iconName = collapsed ? 'icon-caret-up' : 'icon-caret-down';
      collapseIcon.src = getAssetPath(`static/svg/${iconName}.svg`);
    }
  };

  const handleDeleteClick = () => {
    const modal = document.getElementById('delete-confirm-modal') as HTMLElement | null;
    const confirmBtn = document.getElementById('delete-confirm') as HTMLElement | null;
    const cancelBtn = document.getElementById('delete-cancel') as HTMLElement | null;

    if (!modal || !confirmBtn || !cancelBtn) return;

    modal.classList.remove('hidden');

    const handleConfirm = () => {
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
      cleanup();
      sequencer.destroy(); // Assumes sequencer has a destroy() method
    };

    const handleCancel = () => cleanup();

    const cleanup = () => {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  };

  muteBtn.addEventListener('click', handleMuteClick);
  soloBtn.addEventListener('click', handleSoloClick);
  collapseBtn.addEventListener('click', handleCollapseClick);
  deleteBtn.addEventListener('click', handleDeleteClick);

  const refreshUI = () => {
    updateButtonStates();
    const isCollapsed = sequencer.collapsed;
    body.classList.toggle('hidden', isCollapsed);
    if (collapseIcon) {
      collapseIcon.setAttribute('href', isCollapsed ? '#icon-caret-right' : '#icon-caret-down');
    }
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
