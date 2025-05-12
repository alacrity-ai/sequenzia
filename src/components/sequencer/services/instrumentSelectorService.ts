import type { EngineName } from '@/sounds/interfaces/Engine.js';
import { setGlobalActiveInstrument } from '@/sounds/instrument-player.js';
import { getSequencerById } from '@/components/sequencer/stores/sequencerStore.js';
import { recordDiff } from '@/appState/appState.js';
import { createSetInstrumentDiff, createReverseSetInstrumentDiff } from '@/appState/diffEngine/types/sequencer/setInstrument.js';

import {
  getAvailableEngines,
  getAvailableLibraries,
  getAvailableInstruments
} from '@/sounds/instrument-loader.js';

let instrumentSelectModal: HTMLElement;
let instrumentSelect: HTMLSelectElement;
let instrumentSelectConfirm: HTMLElement;
let instrumentCancelBtn: HTMLElement;
let instrumentEngineSelect: HTMLSelectElement;
let instrumentLibrarySelect: HTMLSelectElement;

let currentEngine: EngineName = 'sf2';

export function setupInstrumentSelector(): void {
  instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
  instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
  instrumentSelectConfirm = document.getElementById('instrument-select-confirm') as HTMLElement;
  instrumentCancelBtn = document.getElementById('instrument-cancel-btn') as HTMLElement;
  instrumentEngineSelect = document.getElementById('instrument-engine-select') as HTMLSelectElement;
  instrumentLibrarySelect = document.getElementById('instrument-library-select') as HTMLSelectElement;

  setupEngineOptions();
  attachListeners();
}

function setupEngineOptions(): void {
  const engines = getAvailableEngines();
  instrumentEngineSelect.innerHTML = '';

  engines.forEach(engine => {
    const option = document.createElement('option');
    option.value = engine;
    option.textContent = engine.toUpperCase();
    instrumentEngineSelect.appendChild(option);
  });

  instrumentEngineSelect.value = currentEngine;
}

function attachListeners(): void {
  instrumentEngineSelect.addEventListener('change', async () => {
    currentEngine = instrumentEngineSelect.value as EngineName;
    await refreshLibraries();
  });

  instrumentLibrarySelect.addEventListener('change', () => {
    const event = new CustomEvent('instrument-library-change', { detail: { preselect: null } });
    instrumentLibrarySelect.dispatchEvent(event);
  });

  instrumentLibrarySelect.addEventListener('instrument-library-change', async (e: Event) => {
    const customEvent = e as CustomEvent<{ preselect: string | null }>;
    const selectedLibrary = instrumentLibrarySelect.value;
    const preselected = customEvent.detail?.preselect ?? null;

    try {
      const instruments = await getAvailableInstruments(selectedLibrary, currentEngine);
      instrumentSelect.innerHTML = '';

      instruments.forEach(inst => {
        const option = document.createElement('option');
        option.value = `${currentEngine}/${selectedLibrary}/${inst}`;
        option.textContent = inst
          .split('_')
          .map(word => word ? word[0].toUpperCase() + word.slice(1) : '')
          .join(' ');
        instrumentSelect.appendChild(option);
      });

      if (preselected) {
        instrumentSelect.value = preselected;
      } else if (instruments.length > 0) {
        instrumentSelect.value = `${currentEngine}/${selectedLibrary}/${instruments[0]}`;
      }
    } catch (err) {
      console.error(`Failed to load instruments for library: ${selectedLibrary}`, err);
    }
  });

  instrumentSelectConfirm.addEventListener('click', confirmInstrumentSelection);
  instrumentCancelBtn.addEventListener('click', cancelInstrumentSelection);
}

async function refreshLibraries(
  preselectLibrary: string | null = null,
  preselectInstrument: string | null = null
): Promise<void> {
  try {
    const libraries = await getAvailableLibraries(currentEngine);
    instrumentLibrarySelect.innerHTML = '';

    libraries.forEach(lib => {
      const option = document.createElement('option');
      option.value = lib;
      option.textContent = lib.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      instrumentLibrarySelect.appendChild(option);
    });

    if (preselectLibrary && libraries.includes(preselectLibrary)) {
      instrumentLibrarySelect.value = preselectLibrary;
    } else if (libraries.length > 0) {
      instrumentLibrarySelect.value = libraries[0];
    }

    const event = new CustomEvent('instrument-library-change', { detail: { preselect: preselectInstrument } });
    instrumentLibrarySelect.dispatchEvent(event);
  } catch (err) {
    console.error('Failed to refresh libraries for engine:', currentEngine, err);
  }
}

export async function openInstrumentSelectorModal(
  sequencerId: number,
  currentInstrument: string
): Promise<void> {
  const [engine, library, instrument] = currentInstrument.split('/');
  currentEngine = (engine || 'sf2') as EngineName;
  instrumentEngineSelect.value = currentEngine;

  instrumentSelectModal.classList.remove('hidden');
  instrumentSelectModal.dataset.currentSequencer = String(sequencerId);

  await refreshLibraries(library, currentInstrument);
}

async function confirmInstrumentSelection(): Promise<void> {
  const selectedInstrumentFull = instrumentSelect.value;
  instrumentSelectModal.classList.add('hidden');

  const seqId = Number(instrumentSelectModal.dataset.currentSequencer);

  if (!isNaN(seqId)) {
    const seq = getSequencerById(seqId);
    if (seq) {
      recordDiff(
        createSetInstrumentDiff(seq.id, selectedInstrumentFull),
        createReverseSetInstrumentDiff(seq.id, seq.instrumentName)
      );
      seq.setInstrument(selectedInstrumentFull);
    } else {
      console.warn(`Failed to find sequencer with ID ${seqId}`);
    }
  } else {
    try {
      await setGlobalActiveInstrument(selectedInstrumentFull);
      window.dispatchEvent(new CustomEvent('global-instrument-selected', {
        detail: { fullName: selectedInstrumentFull }
      }));
    } catch (err) {
      console.error('Failed to load global instrument:', selectedInstrumentFull, err);
    }
  }
}

/**
 * Public helper to open the instrument selector modal.
 * Accepts a full instrument name and optional sequencer ID.
 * Will gracefully handle both global instrument selection and sequencer-specific selection.
 *
 * @param fullName - Full instrument name in "engine/library/instrument" format.
 * @param sequencerId - Optional sequencer ID to apply selection to.
 */
export async function refreshInstrumentSelectorModal(fullName: string, sequencerId?: number): Promise<void> {
  const [engine, library, instrument] = fullName.split('/');
  currentEngine = (engine || 'sf2') as EngineName;
  instrumentEngineSelect.value = currentEngine;

  if (sequencerId !== undefined) {
    instrumentSelectModal.dataset.currentSequencer = String(sequencerId);
  } else {
    delete instrumentSelectModal.dataset.currentSequencer;
  }

  instrumentSelectModal.classList.remove('hidden');

  await refreshLibraries(library, fullName);
}


function cancelInstrumentSelection(): void {
  instrumentSelectModal.classList.add('hidden');
}
