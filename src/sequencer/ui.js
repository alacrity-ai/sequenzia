// sequencer/ui.js

import { config } from '../setup/sequencers.js';
import { initConfigModal } from '../userconfig/ConfigInteraction.js';
import { getEditMode, EditModes } from '../setup/editModeStore.js';
import { getTimeSignature, getTotalMeasures } from './transport.js';
import { undo, redo } from '../appState/stateHistory.js';

const SNAP_RESOLUTIONS = {
  "4": "𝅝",      // whole note
  "2": "𝅗𝅥",    // half note
  "1": "𝅘𝅥",   // quarter note
  "0.5": "♪",  // eighth note
  "0.25": "♬", // sixteenth note
  "0.125": "𝅘𝅥𝅰" // thirty-second note
};

let isInitialized = false;
let isPlaying = false;
let isPaused = false;

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
}) {
  if (isInitialized) return;
  isInitialized = true;

  const playBtn = document.getElementById('play-button');
  const playBtnIcon = playBtn.querySelector('use');
  const stopBtn = document.getElementById('stop-button');
  const durationSelect = document.getElementById('note-duration');
  const dottedNoteBtn = document.getElementById('dotted-note-btn');
  const tripletNoteBtn = document.getElementById('triplet-note-btn');
  durationSelect.value = String(config.currentDuration || 1);
  const snapSelect = document.getElementById('snap-resolution');
  snapSelect.value = String(config.snapResolution || 0.25);
  const loopToggle = document.getElementById('loop-toggle');
  const tempoInput = document.getElementById('tempo-input');
  const saveBtn = document.getElementById('save-button');
  const loadBtn = document.getElementById('load-button');
  const loadInput = document.getElementById('load-input');
  const measuresInput = document.getElementById('measures-input');
  const beatsPerMeasureInput = document.getElementById('beats-per-measure-input');
  const configBtn = document.getElementById('config-button');

  const exportModal = document.getElementById('export-modal');
  const exportJsonBtn = document.getElementById('export-json');
  const exportWavBtn = document.getElementById('export-wav');
  const exportMidiBtn = document.getElementById('export-midi');
  const exportCancelBtn = document.getElementById('export-cancel');

  playBtnIcon.setAttribute('href', '#icon-play');
  
  playBtn.addEventListener('click', () => {
    if (!isPlaying && !isPaused) {
      // First play
      isPlaying = true;
      isPaused = false;
      onPlay?.();
      playBtnIcon.setAttribute('href', '#icon-pause');
    } else if (isPlaying) {
      // Pause
      isPlaying = false;
      isPaused = true;
      onPause?.();
      playBtnIcon.setAttribute('href', '#icon-play');
    } else if (isPaused) {
      // Resume
      isPlaying = true;
      isPaused = false;
      onResume?.();
      playBtnIcon.setAttribute('href', '#icon-pause');
    }
  });
  
  stopBtn.addEventListener('click', () => {
    onStop?.();
    isPlaying = false;
    isPaused = false;
    playBtnIcon.setAttribute('href', '#icon-play');
  });

  // Hotkeys 1–6 to change note duration
  const durationHotkeys = {
    'Digit1': 4,
    'Digit2': 2,
    'Digit3': 1,
    'Digit4': 0.5,
    'Digit5': 0.25,
    'Digit6': 0.125
  };
  
  window.addEventListener('keydown', (e) => {
    // Skip if any AI modal is open
    const modalOpen = document.querySelector('.ai-modal:not(.hidden)');
    if (modalOpen) return;
  
    // Ignore when typing into input/textarea
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  
    // Spacebar = play
    if (e.code === 'Space') {
      e.preventDefault();
      playBtn.click();
      return;
    }

    // Undo / Redo
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'z') undo();
      if (e.key === 'y') redo();
    }

    // Prevent accidental browser reload (Ctrl+R / Cmd+R)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      return;
    }

    // Only allow duration keys in NOTE PLACEMENT mode
    if (getEditMode() !== EditModes.NOTE_PLACEMENT) return;
  
    if (durationHotkeys.hasOwnProperty(e.code)) {
      e.preventDefault();
      const duration = durationHotkeys[e.code];
      durationSelect.value = duration;
      durationSelect.dispatchEvent(new Event('change'));
    }

    if (e.key === '.') {
      e.preventDefault();
      dottedNoteBtn?.click();
      return;
    }
  
    if (e.key === '/') {
      e.preventDefault();
      tripletNoteBtn?.click();
      return;
    }
  });

  durationSelect.addEventListener('change', (e) => {
    const newDuration = parseFloat(e.target.value);
    highlightActiveDuration(newDuration);
    onDurationChange?.(newDuration);
  
    getSequencers?.().forEach(seq => {
      const grid = seq.grid;
      if (grid?.getPreviewNote) {
        const note = grid.getPreviewNote();
        if (note) {
          note.duration = newDuration;
          grid.scheduleRedraw();
        }
      }
    });
  });
  
  function highlightActiveDuration(duration) {
    const buttons = document.querySelectorAll('.note-duration-btn');
    buttons.forEach(btn => {
      const btnVal = parseFloat(btn.dataset.value);
  
      btn.classList.remove('bg-purple-700');
      btn.classList.remove('bg-gray-800');
      if (btnVal === duration) {
        btn.classList.add('bg-purple-700');
      } else {
        btn.classList.add('bg-gray-800');
      }
    });
  }

  snapSelect.addEventListener('change', (e) => {
    const newValue = e.target.value;
    // Ensure we're working with a known valid value
    if (SNAP_RESOLUTIONS.hasOwnProperty(newValue)) {
      config.snapResolution = parseFloat(newValue);
      // Always set the select value as a string
      snapSelect.value = String(newValue);
      onSnapChange?.(config.snapResolution);
    }
  });

  loopToggle.addEventListener('change', (e) => {
    onToggleLoop?.(e.target.checked);
  });

  tempoInput.addEventListener('change', (e) => {
    const bpm = parseInt(e.target.value, 10);
    if (!isNaN(bpm)) onTempoChange?.(bpm);
  });

  saveBtn.addEventListener('click', () => {
    if (exportModal) {
      exportModal.classList.remove('hidden');
    } else {
      onSave?.('json'); // fallback to default JSON export if modal is missing
    }
  });

  loadBtn.addEventListener('click', () => {
    loadInput.click();
  });

  loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoad?.(file);
    }
    e.target.value = ''; // clear file input so same file can be loaded again
  });

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      exportModal.classList.add('hidden');
      onSave?.('json');
    });
  }

  if (exportWavBtn) {
    exportWavBtn.addEventListener('click', () => {
      exportModal.classList.add('hidden');
      onSave?.('wav');
    });
  }

  if (exportMidiBtn) {
    exportMidiBtn.addEventListener('click', () => {
      exportModal.classList.add('hidden');
      onSave?.('midi');
    });
  }

  if (exportCancelBtn) {
    exportCancelBtn.addEventListener('click', () => {
      exportModal.classList.add('hidden');
    });
  }

  configBtn.addEventListener('click', () => {
    const configModal = document.getElementById('userconfig-modal');
    configModal.classList.remove('hidden');
  });

  initConfigModal();

  // Initialize inputs with correct values
  measuresInput.value = getTotalMeasures();
  beatsPerMeasureInput.value = getTimeSignature();

  measuresInput.addEventListener('change', (e) => {
    const measures = parseInt(e.target.value, 10);
    if (!isNaN(measures) && measures > 0) {
      onMeasuresChange?.(measures);
    }
  });

  beatsPerMeasureInput.addEventListener('change', (e) => {
    const beats = parseInt(e.target.value, 10);
    if (!isNaN(beats) && beats > 0) {
      onBeatsPerMeasureChange?.(beats);
    }
  });

  highlightActiveDuration(parseFloat(durationSelect.value));
}

export function updateSnapResolution(value) {
  const stringValue = String(value);
  if (SNAP_RESOLUTIONS.hasOwnProperty(stringValue)) {
    config.snapResolution = parseFloat(stringValue);
    snapSelect.value = stringValue;
  }
}

export function resetPlayButtonState() {
  isPlaying = false;
  isPaused = false;
  const playBtn = document.getElementById('play-button');
  const playBtnIcon = playBtn.querySelector('use');
  if (playBtnIcon) playBtnIcon.setAttribute('href', '#icon-play');
}

export function updateMeasuresInput(measures) {
  const measuresInput = document.getElementById('measures-input');
  if (measuresInput) {
    measuresInput.value = measures;
  }
}

export function showLoadingModal() {
  document.getElementById('loading-modal')?.classList.remove('hidden');
}

export function hideLoadingModal() {
  document.getElementById('loading-modal')?.classList.add('hidden');
}