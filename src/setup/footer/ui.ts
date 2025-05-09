// src/sequencer/ui.ts

import { SEQUENCER_CONFIG as config, SNAP_RESOLUTIONS, durationHotkeys } from '../../sequencer/constants/sequencerConstants.js';
import { getActiveSelection } from '../../sequencer/utils/selectionTracker.js';
import { getTimeSignature, getTotalMeasures } from '@/shared/playback/transportService.js';
import { showVelocityModal } from '../../sequencer/ui/modals/velocity/velocityModeMenu.js';
import { showErrorModal } from '../../global/errorGeneric.js';
import Sequencer from '../../sequencer/sequencer.js';
import { isKeyboardListenersAttached } from '../../keyboard/input/keyboard-interaction.js';
import { UserConfigModalController } from '../../userSettings/userConfig.js';

let isInitialized = false;
let isPlaying = false;
let isPaused = false;

interface SetupUIOptions {
  getSequencers: () => Sequencer[];
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDurationChange: (duration: number) => void;
  onSnapChange: (snap: number) => void;
  onToggleLoop: (enabled: boolean) => void;
  onTempoChange: (bpm: number) => void;
  onSave: (format: string) => void;
  onLoad: (file: File) => void;
  onMeasuresChange: (measures: number) => void;
  onBeatsPerMeasureChange: (beats: number) => void;
}

export function setupUI({
  getSequencers,
  onPlay,
  onStop,
  onPause,
  onResume,
  onDurationChange,
  onSnapChange,
  onToggleLoop,
  onTempoChange,
  onSave,
  onLoad,
  onMeasuresChange,
  onBeatsPerMeasureChange
}: SetupUIOptions): void {
  if (isInitialized) return;
  isInitialized = true;

  const playBtn = document.getElementById('play-button') as HTMLElement;
  const snapSelect = document.getElementById('snap-resolution') as HTMLSelectElement;
  snapSelect.value = String(config.snapResolution || 0.25);

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const modalOpen = document.querySelector('.ai-modal:not(.hidden)');
    if (modalOpen) return;

    const tag = (document.activeElement as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      playBtn.click();
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      return;
    }

    // === VELOCITY SHORTCUT ===
    if (e.key === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey && !isKeyboardListenersAttached()) {
      const selection = getActiveSelection();
      if (!selection || selection.selectedNotes.length === 0) {
        showErrorModal('No notes selected. Please select notes before adjusting velocity.');
        return;
      }

      e.preventDefault();
      showVelocityModal(selection.selectedNotes);
      return;
    }
  });

  // === Snap Resolution Select ===
  // snapSelect.addEventListener('change', (e: Event) => {
  //   const target = e.target as HTMLSelectElement;
  //   const newValue = target.value;
  //   if (Object.prototype.hasOwnProperty.call(SNAP_RESOLUTIONS, newValue)) {
  //     config.snapResolution = parseFloat(newValue);
  //     snapSelect.value = String(newValue);
  //     onSnapChange(config.snapResolution);
  //   }
  // });

}

// =========================
// Outside setupUI()
// =========================

export function updateSnapResolution(value: number): void {
  const snapSelect = document.getElementById('snap-resolution') as HTMLSelectElement | null;
  if (!snapSelect) return;

  const stringValue = String(value);
  if (SNAP_RESOLUTIONS.hasOwnProperty(stringValue)) {
    config.snapResolution = parseFloat(stringValue);
    snapSelect.value = stringValue;
  }
}

export function updateMeasuresInput(measures: number): void {
  const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
  if (measuresInput) {
    measuresInput.value = String(measures);
  }
}
