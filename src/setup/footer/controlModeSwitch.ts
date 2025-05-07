// src/setup/controlModeSwitch.js

import { setupExtendModeControls, setupExtendModeUI } from '../../aimode/ExtendMode.js';
import { getOpenAIKey } from '../../userSettings/store/userConfigStore.js';
import { toggleZoomControls } from '../../sequencer/ui/controls/zoomControls.js';
import { setupEditModeControls } from './editModeControls.js';

/**
 * Initializes control mode switching between Note Mode and AI Mode.
 */
export function setupControlModeSwitch(): void {
  const noteModeBtn = document.getElementById('note-mode-btn') as HTMLElement | null;
  const aiModeBtn = document.getElementById('ai-mode-btn') as HTMLElement | null;
  const noteDurationPanel = document.getElementById('note-duration-panel') as HTMLElement | null;
  const aiControlPanel = document.getElementById('ai-control-panel') as HTMLElement | null;

  if (!noteModeBtn || !aiModeBtn || !noteDurationPanel || !aiControlPanel) {
    console.error("Missing essential elements for control mode switching.");
    return;
  }

  function lockSequencerControls(): void {
    document.querySelectorAll<HTMLElement>('.sequencer').forEach(sequencer => {
      const deleteBtn = sequencer.querySelector('.delete-btn') as HTMLElement | null;
      const collapseBtn = sequencer.querySelector('.collapse-btn') as HTMLElement | null;
      const collapseIcon = collapseBtn?.querySelector('use') as SVGUseElement | null;
      const body = sequencer.querySelector('.sequencer-body') as HTMLElement | null;
      const mini = sequencer.querySelector('.mini-contour') as HTMLElement | null;

      if (!deleteBtn || !collapseBtn || !collapseIcon || !body || !mini) return;

      deleteBtn.classList.add('button-locked');
      collapseBtn.classList.add('button-locked');

      toggleZoomControls(sequencer, false);

      if (!body.classList.contains('hidden')) {
        body.classList.add('hidden');
        mini.classList.remove('hidden');
        collapseIcon.setAttribute('href', '#icon-caret-up');
      }
    });
  }

  function unlockSequencerControls(): void {
    document.querySelectorAll<HTMLElement>('.sequencer').forEach(sequencer => {
      const deleteBtn = sequencer.querySelector('.delete-btn') as HTMLElement | null;
      const collapseBtn = sequencer.querySelector('.collapse-btn') as HTMLElement | null;

      deleteBtn?.classList.remove('button-locked');
      collapseBtn?.classList.remove('button-locked');
    });
  }

  function switchToNoteMode(): void {
    // Guard
    if (!noteModeBtn || !aiModeBtn || !noteDurationPanel || !aiControlPanel) return;

    noteModeBtn.classList.replace('bg-gray-800', 'bg-blue-600');
    aiModeBtn.classList.replace('bg-purple-600', 'bg-gray-800');

    noteDurationPanel.classList.remove('hidden');
    aiControlPanel.classList.add('hidden');

    unlockSequencerControls();
  }

  function switchToAIMode(): void {
    if (!getOpenAIKey()) {
      const keyModal = document.getElementById('openai-key-not-set-modal') as HTMLElement | null;
      keyModal?.classList.remove('hidden');
      return;
    }

    if (!noteModeBtn || !aiModeBtn || !noteDurationPanel || !aiControlPanel) return;

    aiModeBtn.classList.replace('bg-gray-800', 'bg-purple-600');
    noteModeBtn.classList.replace('bg-blue-600', 'bg-gray-800');

    noteDurationPanel.classList.add('hidden');
    aiControlPanel.classList.remove('hidden');

    lockSequencerControls();
  }

  // Event listeners
  noteModeBtn.addEventListener('click', switchToNoteMode);
  aiModeBtn.addEventListener('click', switchToAIMode);

  const inpaintModal = document.getElementById('ai-inpaint-modal') as HTMLElement | null;
  const extendModal = document.getElementById('ai-extend-modal') as HTMLElement | null;
  const generateModal = document.getElementById('ai-generate-modal') as HTMLElement | null;

  function setupModalCancelButtons(modal: HTMLElement | null): void {
    if (!modal) return;
    const cancelBtn = modal.querySelector('.cancel-btn') as HTMLElement | null;
    cancelBtn?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  setupModalCancelButtons(inpaintModal);
  setupModalCancelButtons(extendModal);
  setupModalCancelButtons(generateModal);

  setupExtendModeControls();

  document.getElementById('ai-inpaint-btn')?.addEventListener('click', () => {
    inpaintModal?.classList.remove('hidden');
  });

  document.getElementById('ai-extend-btn')?.addEventListener('click', () => {
    extendModal?.classList.remove('hidden');
    setupExtendModeUI();
    setupExtendModeControls();
  });

  document.getElementById('ai-generate-btn')?.addEventListener('click', () => {
    generateModal?.classList.remove('hidden');
  });

  setupEditModeControls();
}
