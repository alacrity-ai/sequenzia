// src/setup/sequencers.ts
import Sequencer from '../sequencer/sequencer.js';
import { setupSequencerGripHandler } from '../sequencer/ui.js';
import { drawMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { getCurrentBeat } from '../sequencer/transport.js';
import { audioCtx, masterGain } from '../audio/audio.js';
import { recordDiff } from '../appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from '../appState/diffEngine/types/sequencer/createSequencer.js';
import { createDeleteSequencerDiff, createReverseDeleteSequencerDiff } from '../appState/diffEngine/types/sequencer/deleteSequencer.js';
import { getAppState, setAppState } from '../appState/appState.js';
import { clearHistory } from '../appState/stateHistory.js';
import { notifyStateUpdated } from '../appState/onStateUpdated.js';
import { GRID_CONFIG as config } from '../sequencer/grid/helpers/constants.js';
import type { SequencerState } from '../appState/interfaces/AppState.js';

export const sequencers: Sequencer[] = [];

const container = document.getElementById('sequencers-container') as HTMLElement;
const template  = document.getElementById('sequencer-template') as HTMLTemplateElement;
const addBtn    = document.getElementById('add-sequencer') as HTMLElement;

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

export function getSequencerById(id: string | number): Sequencer | undefined {
  const targetId = String(id);
  return sequencers.find(seq =>
    String(seq.id) === targetId || String(seq.config?.id) === targetId
  );
}

function updateSoloStates(): void {
  const anySoloed = sequencers.some(s => s.solo);
  sequencers.forEach(s => {
    s.shouldPlay = anySoloed ? s.solo : !s.mute;
  });
}

function toggleButtonState(button: HTMLElement, enabled: boolean): void {
  button.classList.toggle('opacity-100', enabled);
  button.classList.toggle('opacity-40', !enabled);
}

export function createSequencer(initialState?: SequencerState): { seq: Sequencer, wrapper: HTMLElement } {
  const clone = template.content.cloneNode(true) as DocumentFragment;
  const wrapper = clone.querySelector('.sequencer') as HTMLElement;
  container.insertBefore(wrapper, addBtn);

  const newId = sequencers.length;
  const mergedConfig = initialState
    ? { id: newId, ...config, ...initialState.config }
    : { id: newId, ...config };

  const instrument = initialState?.instrument || 'fluidr3-gm/acoustic_grand_piano';
  const seq = new Sequencer(wrapper, mergedConfig, audioCtx, masterGain, instrument);
  seq.id = newId;
  seq.colorIndex = newId;
  seq.mute = false;
  seq.solo = false;
  seq.shouldPlay = true;

  const mini = wrapper.querySelector('canvas.mini-contour') as HTMLCanvasElement;
  if (initialState) seq.setState(initialState);
  drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);

  seq.updateTrackLabel();
  seq.initInstrument();

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

  const muteBtn = wrapper.querySelector('.mute-btn') as HTMLElement;
  const soloBtn = wrapper.querySelector('.solo-btn') as HTMLElement;
  const instrumentBtn = wrapper.querySelector('.instrument-select-btn') as HTMLElement;

  muteBtn.addEventListener('click', () => {
    seq.mute = !seq.mute;
    if (seq.mute) {
      seq.solo = false;
      soloBtn.classList.remove('bg-yellow-200', 'hover:bg-yellow-400');
      soloBtn.classList.add('bg-gray-700', 'hover:bg-purple-700');
      toggleButtonState(soloBtn, false);
    }
    toggleButtonState(muteBtn, seq.mute);
    updateSoloStates();
    seq.seekTo(getCurrentBeat());
  });

  soloBtn.addEventListener('click', () => {
    seq.solo = !seq.solo;
    if (seq.solo) {
      seq.mute = false;
      toggleButtonState(muteBtn, false);
    }
    soloBtn.classList.toggle('bg-yellow-200', seq.solo);
    soloBtn.classList.toggle('bg-gray-700', !seq.solo);
    soloBtn.classList.toggle('hover:bg-yellow-400', seq.solo);
    soloBtn.classList.toggle('hover:bg-purple-700', !seq.solo);
    updateSoloStates();
    seq.seekTo(getCurrentBeat());
  });

  instrumentBtn.addEventListener('click', async () => {
    const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
    const instrumentLibrarySelect = document.getElementById('instrument-library-select') as HTMLSelectElement;
    const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;

    const fullName = seq.instrumentName || 'fluidr3-gm/acoustic_grand_piano';
    const [library] = fullName.split('/');

    instrumentLibrarySelect.value = library;
    instrumentLibrarySelect.dispatchEvent(new CustomEvent('change', {
      detail: { preselect: fullName }
    }));

    instrumentSelectModal.dataset.currentSequencer = String(seq.id);
    instrumentSelectModal.classList.remove('hidden');
  });

  setupSequencerGripHandler(wrapper);

  toggleButtonState(muteBtn, false);
  toggleButtonState(soloBtn, false);
  soloBtn.classList.add('hover:bg-purple-700');

  sequencers.push(seq);
  return { seq, wrapper };
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
    const instrument = 'fluidr3-gm/acoustic_grand_piano';
    recordDiff(
      createCreateSequencerDiff(newId, instrument),
      createReverseCreateSequencerDiff(newId)
    );
  });
}
