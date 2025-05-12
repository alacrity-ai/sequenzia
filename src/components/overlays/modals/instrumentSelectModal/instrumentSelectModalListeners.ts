import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { EngineName } from '@/sounds/interfaces/Engine.js';

import { confirmInstrumentSelection } from '@/sounds/helpers/instrumentSelect.js';
import { getAvailableEngines, getAvailableLibraries, getAvailableInstruments } from '@/sounds/helpers/getInstruments.js';

export interface InstrumentSelectModalOptions {
  sequencerId?: number | null;
  currentInstrument?: string; // e.g. 'sf2/fluidr3-gm/acoustic_grand_piano'
  hide: () => void;
}

/**
 * Attaches listeners and populates dynamic content for the Instrument Select Modal.
 */
export function attachInstrumentSelectModalListeners(
  modal: HTMLElement,
  options: InstrumentSelectModalOptions
): ListenerAttachment {
  const engineSelect = modal.querySelector<HTMLSelectElement>('#instrument-engine-select');
  const librarySelect = modal.querySelector<HTMLSelectElement>('#instrument-library-select');
  const instrumentSelect = modal.querySelector<HTMLSelectElement>('#instrument-select');
  const loopToggle = modal.querySelector<HTMLInputElement>('#instrument-loop-toggle');
  const confirmButton = modal.querySelector<HTMLButtonElement>('#instrument-select-confirm');
  const cancelButton = modal.querySelector<HTMLButtonElement>('#instrument-cancel-btn');

  const { currentInstrument } = options;
  let currentEngine: string | null = null;
  let currentLibrary: string | null = null;
  let currentInstrumentName: string | null = null;

  if (currentInstrument) {
    const parts = currentInstrument.split('/');
    currentEngine = parts[0] || null;
    currentLibrary = parts[1] || null;
    currentInstrumentName = parts[2] || null;
  }

  const populateEngineOptions = () => {
    const engines = getAvailableEngines();
    if (engineSelect) {
      engineSelect.innerHTML = '';
      engines.forEach(engine => {
        const optionEl = document.createElement('option');
        optionEl.value = engine;
        optionEl.textContent = engine;
        engineSelect.appendChild(optionEl);
      });

      if (currentEngine && engines.includes(currentEngine as EngineName)) {
        engineSelect.value = currentEngine;
      }
    }
  };

  const populateLibraryOptions = async () => {
    if (!engineSelect) return;

    const libraries = await getAvailableLibraries(engineSelect.value as EngineName);

    if (librarySelect) {
      librarySelect.innerHTML = '';

      libraries.forEach(lib => {
        const optionEl = document.createElement('option');
        optionEl.value = lib;
        optionEl.textContent = lib;
        librarySelect.appendChild(optionEl);
      });

      if (currentLibrary && libraries.includes(currentLibrary)) {
        librarySelect.value = currentLibrary;
      } else if (libraries.length > 0) {
        librarySelect.value = libraries[0];  // Select first library by default
      }
    }
  };

  const populateInstrumentOptions = async () => {
    if (!engineSelect || !librarySelect) return;
    const instruments = await getAvailableInstruments(librarySelect.value, engineSelect.value as EngineName);
    if (instrumentSelect) {
      instrumentSelect.innerHTML = '';
      instruments.forEach(instr => {
        const optionEl = document.createElement('option');
        optionEl.value = instr;
        optionEl.textContent = instr;
        instrumentSelect.appendChild(optionEl);
      });

      if (currentInstrumentName && instruments.includes(currentInstrumentName)) {
        instrumentSelect.value = currentInstrumentName;
      }
    }
  };

  const handleEngineChange = async () => {
    await populateLibraryOptions();
    await populateInstrumentOptions();
  };

  const handleLibraryChange = () => {
    populateInstrumentOptions();
  };

  const handleConfirm = async () => {
    if (!engineSelect || !librarySelect || !instrumentSelect || !loopToggle) return;

    const instrumentFullname = `${engineSelect.value}/${librarySelect.value}/${instrumentSelect.value}`;

    await confirmInstrumentSelection(instrumentFullname, options.sequencerId);

    options.hide();
  };

  const handleCancel = () => {
    options.hide();
  };

  // Initial population
  (async () => {
    populateEngineOptions();
    await populateLibraryOptions();
    await populateInstrumentOptions();
  })();

  // Event listeners
  engineSelect?.addEventListener('change', handleEngineChange);
  librarySelect?.addEventListener('change', handleLibraryChange);
  confirmButton?.addEventListener('click', handleConfirm);
  cancelButton?.addEventListener('click', handleCancel);

  return {
    detach: () => {
      engineSelect?.removeEventListener('change', handleEngineChange);
      librarySelect?.removeEventListener('change', handleLibraryChange);
      confirmButton?.removeEventListener('click', handleConfirm);
      cancelButton?.removeEventListener('click', handleCancel);
    },
    refreshUI: async () => {
      populateEngineOptions();
      await populateLibraryOptions();
      await populateInstrumentOptions();
    }
  };
}
