import Sequencer from '../sequencer/sequencer.js';
import { drawMiniContour } from '../sequencer/mini-contour.js';
import { importSessionFromJSON } from '../export/load.js';
import { getCurrentBeat } from '../sequencer/transport.js';
import { audioCtx, masterGain } from '../audio/audio.js';
import { recordDiff } from '../appState/appState.js'
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from '../appState/diffEngine/types/sequencer/createSequencer.js';
import { createDeleteSequencerDiff, createReverseDeleteSequencerDiff } from '../appState/diffEngine/types/sequencer/deleteSequencer.js';
import { getAppState, setAppState } from '../appState/appState.js';
import { clearHistory } from '../appState/stateHistory.js';
import { notifyStateUpdated } from '../appState/onStateUpdated.js';

export const config = {
  cellWidth: 40,
  cellHeight: 20,
  visibleNotes: 36,
  noteRange: ['C1', 'B9'],
  currentDuration: 1,
  snapResolution: 1,
  isTripletMode: false,
  loopEnabled: false,
  useEqualTemperament: true,
};

export const sequencers = [];

const container = document.getElementById('sequencers-container');
const template  = document.getElementById('sequencer-template');
const addBtn    = document.getElementById('add-sequencer');

export function refreshPlaybackAt(currentBeat) {
  sequencers.forEach(seq => {
    seq.seekTo(currentBeat);
  });
}

export function toggleZoomControls(wrapper, show) {
  wrapper.querySelector('.zoom-in-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-out-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-reset-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-button-divider')?.classList.toggle('hidden', !show);
}

export function getSequencers() {
  return sequencers;
}

export function getSequencerById(id) {
  const targetId = String(id); // force both sides to string
  return getSequencers().find(seq =>
    String(seq.id) === targetId || String(seq.config?.id) === targetId
  );
}

function updateSoloStates() {
  const anySoloed = sequencers.some(s => s.solo);
  sequencers.forEach(s => {
    s.shouldPlay = anySoloed ? s.solo : !s.mute;
  });
}

function toggleButtonState(button, enabled) {
  button.classList.toggle('opacity-100', enabled);
  button.classList.toggle('opacity-40', !enabled);
}

export function createSequencer(initialState) {
  const clone   = template.content.cloneNode(true);
  const wrapper = clone.querySelector('.sequencer');
  container.insertBefore(wrapper, addBtn);

  const newId = sequencers.length;
  const merged = initialState
    ? { id: newId, ...config, ...initialState.config }
    : { id: newId, ...config };

  const instrument = initialState?.instrument || 'fluidr3-gm/acoustic_grand_piano';

  const seq = new Sequencer(wrapper, merged, audioCtx, masterGain, instrument);
  seq.id = newId;
  seq.colorIndex = newId;
  seq.mute = false;
  seq.solo = false;
  seq.shouldPlay = true;

  const mini = wrapper.querySelector('canvas.mini-contour');
  if (initialState) seq.setState(initialState);
  drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);

  seq.updateTrackLabel();
  seq.initInstrument(); // ✅ instrument already correctly set now

  // Collapse Button
  const collapseBtn = wrapper.querySelector('.collapse-btn');
  const collapseIcon = collapseBtn.querySelector('use');
  const body = wrapper.querySelector('.sequencer-body');
  
  collapseBtn.addEventListener('click', () => {
    const hidden = body.classList.toggle('hidden');
    collapseIcon.setAttribute('href', hidden ? '#icon-caret-up' : '#icon-caret-down');
    mini.classList.toggle('hidden', !hidden);
    toggleZoomControls(wrapper, !hidden);
    if (hidden) drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
  });

  // Delete Button
  const deleteBtn = wrapper.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    const modal = document.getElementById('delete-confirm-modal');
    const confirmBtn = document.getElementById('delete-confirm');
    const cancelBtn = document.getElementById('delete-cancel');
  
    modal.classList.remove('hidden');
  
    const handleConfirm = () => {
      // 🧠 Construct forward + reverse diffs
      const forwardDiff = createDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes);
      const reverseDiff = createReverseDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes);
  
      recordDiff(forwardDiff, reverseDiff);
  
      // 🔁 AppState will be updated, and resyncFromState will destroy the live sequencer automatically
      cleanup();
    };
  
    const handleCancel = () => {
      cleanup();
    };
  
    const cleanup = () => {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
  
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });

  // Mute/Solo buttons
  const muteBtn = wrapper.querySelector('.mute-btn');
  const soloBtn = wrapper.querySelector('.solo-btn');
  const instrumentBtn = wrapper.querySelector('.instrument-select-btn');

  muteBtn.addEventListener('click', () => {
    seq.mute = !seq.mute;
    if (seq.mute) {
      seq.solo = false;
      // Update solo button visual state
      soloBtn.classList.remove('bg-yellow-200');
      soloBtn.classList.add('bg-gray-700');
      soloBtn.classList.remove('hover:bg-yellow-400');
      soloBtn.classList.add('hover:bg-purple-700');
      toggleButtonState(soloBtn, false);
    }
    toggleButtonState(muteBtn, seq.mute);
    updateSoloStates();
    // After updateSoloStates();
    const beat = getCurrentBeat();
    seq.seekTo(beat); // restart only this track    
  });

  soloBtn.addEventListener('click', () => {
    seq.solo = !seq.solo;
    if (seq.solo) {
      seq.mute = false;
      toggleButtonState(muteBtn, false);
    }
    // Update solo button classes
    soloBtn.classList.toggle('bg-yellow-200', seq.solo);
    soloBtn.classList.toggle('bg-gray-700', !seq.solo);
    // Add special hover class when soloed
    soloBtn.classList.toggle('hover:bg-yellow-400', seq.solo);
    soloBtn.classList.toggle('hover:bg-purple-700', !seq.solo);
    updateSoloStates();
    // After updateSoloStates();
    const beat = getCurrentBeat();
    seq.seekTo(beat); // restart only this track    
  });

  // Instrument select button
  instrumentBtn.addEventListener('click', async () => {
    const instrumentSelectModal = document.getElementById('instrument-select-modal');
    const instrumentLibrarySelect = document.getElementById('instrument-library-select');
    const instrumentSelect = document.getElementById('instrument-select');
  
    // 🔍 Parse instrument into [library, name]
    const fullName = seq.instrumentName || 'fluidr3-gm/acoustic_grand_piano';
    const [library, instrument] = fullName.split('/');
  
    // ⬇️ Set library dropdown
    instrumentLibrarySelect.value = library;
  
    // ⬇️ Populate instrument dropdown and set current instrument
    await instrumentLibrarySelect.dispatchEvent(new CustomEvent('change', {
      detail: { preselect: fullName }
    }));
  
    // ⬇️ Store current sequencer ID
    instrumentSelectModal.dataset.currentSequencer = seq.id;
  
    // ⬇️ Show modal
    instrumentSelectModal.classList.remove('hidden');
  });
  

  // Initial visual state
  toggleButtonState(muteBtn, false);
  toggleButtonState(soloBtn, false);
  soloBtn.classList.add('hover:bg-purple-700'); // Add initial hover state

  sequencers.push(seq);
  return { seq, wrapper };
}

export function destroyAllSequencers() {
  // 🔁 Destroy all live sequencers and clear UI
  sequencers.slice().forEach(seq => seq.destroy());
  sequencers.length = 0;

  // 🔁 Reset canonical state
  const state = getAppState();
  const newState = structuredClone(state);
  newState.sequencers = [];

  // 🔁 Clear undo/redo history
  clearHistory();

  // 🔁 Commit and notify
  setAppState(newState);
  notifyStateUpdated(newState);
}

export function setupAddTrackButton() {
  const canvas = document.getElementById('global-mini-contour');

  addBtn.addEventListener('click', () => {
    const newId = sequencers.length;
    const instrument = 'fluidr3-gm/acoustic_grand_piano';

    recordDiff(
      createCreateSequencerDiff(newId, instrument),
      createReverseCreateSequencerDiff(newId)
    );
  });
}
