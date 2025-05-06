// src/sequencer/ui.ts

import { SEQUENCER_CONFIG as config, SNAP_RESOLUTIONS, durationHotkeys } from '../../sequencer/constants/sequencerConstants.js';
import { initConfigModal } from '../../userconfig/initUserConfig.js';
import { getActiveSelection } from '../../sequencer/utils/selectionTracker.js';
import { getTimeSignature, getTotalMeasures } from '../../sequencer/transport.js';
import { showVelocityModal } from '../../sequencer/ui/modals/velocity/velocityModeMenu.js';
import { showErrorModal } from '../../global/errorGeneric.js';
import Sequencer from '../../sequencer/sequencer.js';
import { isKeyboardListenersAttached } from '../../keyboard/input/keyboard-interaction.js';


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
  const playBtnIcon = playBtn.querySelector('use') as SVGUseElement;
  const stopBtn = document.getElementById('stop-button') as HTMLElement;
  const snapSelect = document.getElementById('snap-resolution') as HTMLSelectElement;
  const loopToggle = document.getElementById('loop-toggle') as HTMLInputElement;
  const tempoInput = document.getElementById('tempo-input') as HTMLInputElement;
  const saveBtn = document.getElementById('save-button') as HTMLElement;
  const loadBtn = document.getElementById('load-button') as HTMLElement;
  const measuresInput = document.getElementById('measures-input') as HTMLInputElement;
  const beatsPerMeasureInput = document.getElementById('beats-per-measure-input') as HTMLInputElement;
  const configBtn = document.getElementById('config-button') as HTMLElement;

  const exportModal = document.getElementById('export-modal') as HTMLElement | null;
  const exportJsonBtn = document.getElementById('export-json') as HTMLElement;
  const exportWavBtn = document.getElementById('export-wav') as HTMLElement;
  const exportMidiBtn = document.getElementById('export-midi') as HTMLElement;
  const exportCancelBtn = document.getElementById('export-cancel') as HTMLElement;

  snapSelect.value = String(config.snapResolution || 0.25);

  // === Loading Midi / Json ===
  const importModal = document.getElementById('import-modal') as HTMLElement | null;
  const importJsonBtn = document.getElementById('import-json') as HTMLElement | null;
  const importMidiBtn = document.getElementById('import-midi') as HTMLElement | null;
  const importCancelBtn = document.getElementById('import-cancel') as HTMLElement | null;
  const loadInput = document.getElementById('load-input') as HTMLInputElement | null; // already defined
  
  loadBtn.addEventListener('click', () => {
    importModal?.classList.remove('hidden');
  });

  if (loadInput) {
    loadInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onLoad(file);
      }
      target.value = '';
    });
  }  

  if (importJsonBtn) {
    importJsonBtn.addEventListener('click', () => {
      importModal?.classList.add('hidden');
      if (loadInput) {
        loadInput.setAttribute('accept', '.json');
        loadInput.click();
      }
    });
  }
  
  if (importMidiBtn) {
    importMidiBtn.addEventListener('click', () => {
      importModal?.classList.add('hidden');
      if (loadInput) {
        loadInput.setAttribute('accept', '.mid,.midi');
        loadInput.click();
      }
    });
  }
  
  if (importCancelBtn) {
    importCancelBtn.addEventListener('click', () => {
      importModal?.classList.add('hidden');
    });
  }

  // === Play/Stop/Pause Buttons ===
  playBtnIcon.setAttribute('href', '#icon-play');

  playBtn.addEventListener('click', () => {
    if (!isPlaying && !isPaused) {
      isPlaying = true;
      isPaused = false;
      onPlay();
      playBtnIcon.setAttribute('href', '#icon-pause');
    } else if (isPlaying) {
      isPlaying = false;
      isPaused = true;
      onPause();
      playBtnIcon.setAttribute('href', '#icon-play');
    } else if (isPaused) {
      isPlaying = true;
      isPaused = false;
      onResume();
      playBtnIcon.setAttribute('href', '#icon-pause');
    }
  });

  stopBtn.addEventListener('click', () => {
    onStop();
    isPlaying = false;
    isPaused = false;
    playBtnIcon.setAttribute('href', '#icon-play');
  });

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
  snapSelect.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newValue = target.value;
    if (Object.prototype.hasOwnProperty.call(SNAP_RESOLUTIONS, newValue)) {
      config.snapResolution = parseFloat(newValue);
      snapSelect.value = String(newValue);
      onSnapChange(config.snapResolution);
    }
  });

  // === Loop Toggle ===
  loopToggle.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    onToggleLoop(target.checked);
  });

  // === Tempo Input ===
  tempoInput.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const bpm = parseInt(target.value, 10);
    // Blur the input
    target.blur();
    if (!isNaN(bpm)) {
      onTempoChange(bpm);
    }
  });

  // === Save Button ===
  saveBtn.addEventListener('click', () => {
    if (exportModal) {
      exportModal.classList.remove('hidden');
    } else {
      onSave('json');
    }
  });


// === Export Type Modal Buttons ===
if (exportJsonBtn) {
  exportJsonBtn.addEventListener('click', () => {
    exportModal?.classList.add('hidden');
    onSave?.('json');
  });
}

if (exportWavBtn) {
  exportWavBtn.addEventListener('click', () => {
    exportModal?.classList.add('hidden');
    requestAnimationFrame(() => {
      onSave?.('wav');
    });
  });
}

if (exportMidiBtn) {
  exportMidiBtn.addEventListener('click', () => {
    exportModal?.classList.add('hidden');
    onSave?.('midi');
  });
}

if (exportCancelBtn) {
  exportCancelBtn.addEventListener('click', () => {
    exportModal?.classList.add('hidden');
  });
}

// === User Config Button ===
configBtn?.addEventListener('click', () => {
  const configModal = document.getElementById('userconfig-modal') as HTMLElement | null;
  configModal?.classList.remove('hidden');
});

// Initialize the User Config Modal
initConfigModal();

// Initialize Footer Bar inputs with correct values
if (measuresInput) measuresInput.value = String(getTotalMeasures());
if (beatsPerMeasureInput) beatsPerMeasureInput.value = String(getTimeSignature());

measuresInput?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  const measures = parseInt(target.value, 10);
  if (!isNaN(measures) && measures > 0) {
    onMeasuresChange?.(measures);
  }
});

beatsPerMeasureInput?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  const beats = parseInt(target.value, 10);
  if (!isNaN(beats) && beats > 0) {
    onBeatsPerMeasureChange?.(beats);
  }
});
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

export function resetPlayButtonState(): void {
  isPlaying = false;
  isPaused = false;
  const playBtn = document.getElementById('play-button');
  const playBtnIcon = playBtn?.querySelector('use');
  if (playBtnIcon) playBtnIcon.setAttribute('href', '#icon-play');
}

export function updateMeasuresInput(measures: number): void {
  const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
  if (measuresInput) {
    measuresInput.value = String(measures);
  }
}
