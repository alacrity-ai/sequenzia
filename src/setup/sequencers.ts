// src/setup/sequencers.ts
import Sequencer from '../sequencer/sequencer.js';
import { refreshInstrumentSelectorModal } from './instrumentSelector.js';
import { setupVolumeBar } from './controls/sequencerVolume';
import { setupSequencerGripHandler } from '../sequencer/ui.js';
import { drawMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { getCurrentBeat } from '../sequencer/transport.js';
import { getAudioContext as audioCtx, getMasterGain } from '../audio/audio.js';
import { recordDiff } from '../appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from '../appState/diffEngine/types/sequencer/createSequencer.js';
import { createDeleteSequencerDiff, createReverseDeleteSequencerDiff } from '../appState/diffEngine/types/sequencer/deleteSequencer.js';
import { getAppState, setAppState } from '../appState/appState.js';
import { clearHistory } from '../appState/stateHistory.js';
import { notifyStateUpdated } from '../appState/onStateUpdated.js';
import { GRID_CONFIG as config } from '../sequencer/grid/helpers/constants.js'; // Imported as 'config'
import type { SequencerState } from '../appState/interfaces/AppState.js';

export const sequencers: Sequencer[] = [];

const container = document.getElementById('sequencers-container') as HTMLElement;
const template  = document.getElementById('sequencer-template') as HTMLTemplateElement;
const addBtn    = document.getElementById('add-sequencer') as HTMLElement;

export function createSequencer(initialState?: SequencerState): { seq: Sequencer, wrapper: HTMLElement } {
  const clone = template.content.cloneNode(true) as DocumentFragment;
  const wrapper = clone.querySelector('.sequencer') as HTMLElement;
  container.insertBefore(wrapper, addBtn);

  const newId = sequencers.length;

  const mergedConfig = { id: newId, ...config };

  const instrument = initialState?.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano';
  const seq = new Sequencer(wrapper, mergedConfig, audioCtx(), getMasterGain(), instrument);
  seq.id = newId;
  seq.colorIndex = newId;
  seq.mute = false;
  seq.solo = false;
  seq.shouldPlay = true;
  seq.volume = 1.0;

  const mini = wrapper.querySelector('canvas.mini-contour') as HTMLCanvasElement;
  if (initialState) {
    seq.setState({
      notes: initialState.notes,
      config: {},
      instrument: initialState.instrument,
    });
  }
  drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);  

  seq.updateTrackLabel();
  seq.initInstrument();

  // Setup the volume bar
  setupVolumeBar(wrapper, seq);

  const collapseBtn = wrapper.querySelector('.collapse-btn') as HTMLElement;
  const collapseIcon = collapseBtn.querySelector('use')!;
  const body = wrapper.querySelector('.sequencer-body') as HTMLElement;

  collapseBtn.addEventListener('click', () => {
    const hidden = body.classList.toggle('hidden');
    collapseIcon.setAttribute('href', hidden ? '#icon-caret-up' : '#icon-caret-down');
    mini.classList.toggle('hidden', !hidden);
    toggleZoomControls(wrapper, !hidden);
    if (hidden) drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
  });

  const deleteBtn = wrapper.querySelector('.delete-btn') as HTMLElement;
  deleteBtn.addEventListener('click', () => {
    const modal = document.getElementById('delete-confirm-modal') as HTMLElement;
    const confirmBtn = document.getElementById('delete-confirm') as HTMLElement;
    const cancelBtn = document.getElementById('delete-cancel') as HTMLElement;

    modal.classList.remove('hidden');

    const handleConfirm = () => {
      const forwardDiff = createDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes);
      const reverseDiff = createReverseDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes);
    
      recordDiff(forwardDiff, reverseDiff);
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

  // Buttons on the sequencer, mute, solo, and select instrument
  const muteBtn = wrapper.querySelector('.mute-btn') as HTMLElement;
  const soloBtn = wrapper.querySelector('.solo-btn') as HTMLElement;
  const instrumentBtn = wrapper.querySelector('.instrument-select-btn') as HTMLElement;

  function setButtonState(button: HTMLElement, isActive: boolean): void {
    button.classList.toggle('side-button-activated', isActive);
  }  

  muteBtn.addEventListener('click', () => {
    seq.mute = !seq.mute;
    if (seq.mute) seq.solo = false;
  
    // Set based on actual state
    setButtonState(muteBtn, seq.mute);
    setButtonState(soloBtn, seq.solo);
  
    updateSoloStates();
    seq.seekTo(getCurrentBeat());
  });
  
  soloBtn.addEventListener('click', () => {
    seq.solo = !seq.solo;
    if (seq.solo) seq.mute = false;
  
    setButtonState(soloBtn, seq.solo);
    setButtonState(muteBtn, seq.mute);
  
    updateSoloStates();
    seq.seekTo(getCurrentBeat());
  });
  

  instrumentBtn.addEventListener('click', async () => {
    const fullName = seq.instrumentName || 'sf2/fluidr3-gm/acoustic_grand_piano';
  
    await refreshInstrumentSelectorModal(fullName, seq.id);
  
    const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
    instrumentSelectModal.classList.remove('hidden');
  });  

  setupSequencerGripHandler(wrapper);
  sequencers.push(seq);
  return { seq, wrapper };
}

export function refreshPlaybackAt(currentBeat: number): void {
  sequencers.forEach(seq => {
    seq.seekTo(currentBeat);
  });
}

export function toggleZoomControls(wrapper: HTMLElement, show: boolean): void {
  wrapper.querySelector('.zoom-in-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-out-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-reset-btn')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.zoom-button-divider')?.classList.toggle('hidden', !show);
  wrapper.querySelector('.grip-handle')?.classList.toggle('hidden', !show);
}

export function getSequencers(): Sequencer[] {
  return sequencers;
}

export function getSequencerById(id: number): Sequencer | undefined {
  const targetId = id;
  return sequencers.find(seq => seq.id === targetId);
}

function updateSoloStates(): void {
  const anySoloed = sequencers.some(s => s.solo);
  sequencers.forEach(s => {
    s.shouldPlay = anySoloed ? s.solo : !s.mute;
  });
}

export function destroyAllSequencers(): void {
  sequencers.slice().forEach(seq => seq.destroy());
  sequencers.length = 0;

  const state = getAppState();
  const newState = structuredClone(state);
  newState.sequencers = [];

  clearHistory();
  setAppState(newState);
  notifyStateUpdated(newState);
}

export function setupAddTrackButton(): void {
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;

  addBtn.addEventListener('click', () => {
    const newId = sequencers.length;
    const instrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
    recordDiff(
      createCreateSequencerDiff(newId, instrument),
      createReverseCreateSequencerDiff(newId)
    );
  });
}
