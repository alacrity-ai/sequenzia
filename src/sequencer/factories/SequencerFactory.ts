// src/setup/sequencers.ts
import Sequencer from '../sequencer.js';
import { refreshInstrumentSelectorModal } from '../ui/controls/instrumentSelector.js';
import { setupVolumeBar } from '../ui/controls/sequencerVolume';
import { setupPanBar } from '../ui/controls/sequencerPan';
import { setupSequencerGripHandler } from '../ui/controls/gripHandler.js';
import { drawMiniContour } from '../ui/renderers/drawMiniContour.js';
import { getAudioContext as audioCtx, getMasterGain } from '../../sounds/audio/audio.js';
import { recordDiff } from '../../appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from '../../appState/diffEngine/types/sequencer/createSequencer.js';
import { createDeleteSequencerDiff, createReverseDeleteSequencerDiff } from '../../appState/diffEngine/types/sequencer/deleteSequencer.js';
import { SEQUENCER_CONFIG as config } from '../constants/sequencerConstants.js';
import { initZoomControls, toggleZoomControls } from '../ui/controls/zoomControls.js';

import { ListenerRegistry } from '../../setup/stores/ListenerRegistry.js';
import type { SequencerState } from '../../appState/interfaces/AppState.js';

export const sequencers: Sequencer[] = [];

const container = document.getElementById('sequencers-container') as HTMLElement;
const template  = document.getElementById('sequencer-template') as HTMLTemplateElement;
const addBtn    = document.getElementById('add-sequencer') as HTMLElement;

export function createSequencer(initialState?: SequencerState): { seq: Sequencer, wrapper: HTMLElement } {
  const registry = new ListenerRegistry();

  const clone = template.content.cloneNode(true) as DocumentFragment;
  const wrapper = clone.querySelector('.sequencer') as HTMLElement;
  container.insertBefore(wrapper, addBtn);

  const newId = sequencers.length;
  const mergedConfig = { id: newId, ...config };
  const instrument = initialState?.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano';
  const seq = new Sequencer(wrapper, mergedConfig, audioCtx(), getMasterGain(), instrument, true, newId);
  seq.id = newId;
  seq.colorIndex = newId;
  seq.mute = false;
  seq.solo = false;
  seq.volume = 100 / 127;

  if (initialState?.notes && seq.matrix) {
    seq.matrix.setNotes(initialState.notes);
  }

  const mini = wrapper.querySelector('canvas.mini-contour') as HTMLCanvasElement;
  if (initialState) {
    seq.setState({
      notes: initialState.notes,
      config: {},
      instrument: initialState.instrument,
      volume: initialState.volume,
      pan: initialState.pan,
    });
  }
  drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);

  seq.updateTrackLabel();
  seq.initInstrument();

  setupVolumeBar(wrapper, seq);
  setupPanBar(wrapper, seq);

  const collapseBtn = wrapper.querySelector('.collapse-btn') as HTMLElement;
  const collapseIcon = collapseBtn.querySelector('use')!;
  const body = wrapper.querySelector('.sequencer-body') as HTMLElement;

  registry.on(collapseBtn, 'click', () => {
    const hidden = body.classList.toggle('hidden');
    collapseIcon.setAttribute('href', hidden ? '#icon-caret-up' : '#icon-caret-down');
    mini.classList.toggle('hidden', !hidden);
    // toggleZoomControls(wrapper, !hidden);
    seq.setCollapsed(hidden);
    if (hidden) drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
  });

  const deleteBtn = wrapper.querySelector('.delete-btn') as HTMLElement;
  registry.on(deleteBtn, 'click', () => {
    const modal = document.getElementById('delete-confirm-modal') as HTMLElement;
    const confirmBtn = document.getElementById('delete-confirm') as HTMLElement;
    const cancelBtn = document.getElementById('delete-cancel') as HTMLElement;

    modal.classList.remove('hidden');

    const handleConfirm = () => {
      recordDiff(
        createDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes, seq.volume, seq.pan),
        createReverseDeleteSequencerDiff(seq.id, seq.instrumentName, seq.notes, seq.volume, seq.pan)
      );
      cleanup();
    };

    const handleCancel = () => cleanup();

    const cleanup = () => {
      modal.classList.add('hidden');
      registry.clearHandler(confirmBtn, 'click', handleConfirm);
      registry.clearHandler(cancelBtn, 'click', handleCancel);
    };

    registry.on(confirmBtn, 'click', handleConfirm);
    registry.on(cancelBtn, 'click', handleCancel);
  });

  const muteBtn = wrapper.querySelector('.mute-btn') as HTMLElement;
  const soloBtn = wrapper.querySelector('.solo-btn') as HTMLElement;
  const instrumentBtn = wrapper.querySelector('.instrument-select-btn') as HTMLElement;

  const setButtonState = (btn: HTMLElement, active: boolean) =>
    btn.classList.toggle('side-button-activated', active);

  registry.on(muteBtn, 'click', () => {
    seq.toggleMute();
    setButtonState(muteBtn, seq.mute);
    setButtonState(soloBtn, seq.solo);
  });

  registry.on(soloBtn, 'click', () => {
    seq.toggleSolo();
    setButtonState(muteBtn, seq.mute);
    setButtonState(soloBtn, seq.solo);
  });

  registry.on(instrumentBtn, 'click', async () => {
    const fullName = seq.instrumentName || 'sf2/fluidr3-gm/acoustic_grand_piano';
    await refreshInstrumentSelectorModal(fullName, seq.id);
    const modal = document.getElementById('instrument-select-modal') as HTMLElement;
    modal.classList.remove('hidden');
  });

  setupSequencerGripHandler(wrapper, seq.matrix!, registry);
  initZoomControls(wrapper, () => seq.matrix?.zoomIn(), () => seq.matrix?.zoomOut(), () => seq.matrix?.resetZoom(), registry);
  sequencers.push(seq);

  // Attach the registry to the sequencer for cleanup later
  seq.setRegistry(registry);

  // Uncollapse
  seq.setCollapsed(false);

  return { seq, wrapper };
}

export function getSequencers(): Sequencer[] {
  return sequencers;
}

export function getSequencerById(id: number): Sequencer | undefined {
  const targetId = id;
  return sequencers.find(seq => seq.id === targetId);
}

export function destroyAllSequencers(): void {
  // This is correct. The diff actions themselves will call seq.destroy and remove sequencers from the global array
  for (const seq of sequencers.slice()) {
    recordDiff(
      createDeleteSequencerDiff(
        seq.id,
        seq.instrumentName,
        seq.matrix?.getNoteManager().getAll() ?? [],
        seq.volume,
        seq.pan
      ),
      createReverseDeleteSequencerDiff(
        seq.id,
        seq.instrumentName,
        seq.matrix?.getNoteManager().getAll() ?? [],
        seq.volume,
        seq.pan
      )
    );
  }
}

export function setupAddTrackButton(): void {
  addBtn.addEventListener('click', () => {
    const newId = sequencers.length;
    const instrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
    recordDiff(
      createCreateSequencerDiff(newId, instrument),
      createReverseCreateSequencerDiff(newId)
    );
  });
}
