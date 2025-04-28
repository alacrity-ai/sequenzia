// src/setup/instrumentSelector.ts

import { setActiveInstrument, getActiveInstrumentName } from '../sf2/sf2-player.js';
import { getSequencerById } from './sequencers.js';
import { recordDiff } from '../appState/appState.js';
import { createSetInstrumentDiff, createReverseSetInstrumentDiff } from '../appState/diffEngine/types/sequencer/setInstrument.js';
import {
  getMalletInstruments,
  getDrumMachineInstruments,
  getSmolkenInstruments,
  getSoundfontInstruments,
  getElectricPianoInstruments,
  getSplendidGrandPianoInstruments
} from '../sf2/sf2-loader.js';

export async function setupInstrumentSelector(): Promise<void> {
  const instrumentSelectBtn = document.getElementById('instrument-select-btn') as HTMLElement;
  const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
  const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
  const instrumentSelectConfirm = document.getElementById('instrument-select-confirm') as HTMLElement;
  const instrumentCancelBtn = document.getElementById('instrument-cancel-btn') as HTMLElement;
  const instrumentLibrarySelect = document.getElementById('instrument-library-select') as HTMLSelectElement;

  // Populate initial library options (fluidr3-gm, musyngkite, etc)
  const instrumentLibraries: Record<string, 'soundfont' | 'builtin'> = {
    'fluidr3-gm': 'soundfont',
    'musyngkite': 'soundfont',
    'fatboy': 'soundfont',
    'splendidgrandpiano': 'builtin',
    'electricpiano': 'builtin',
    'mallets': 'builtin',
    'drummachines': 'builtin',
    'smolken': 'builtin'
  };

  Object.entries(instrumentLibraries).forEach(([key]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    instrumentLibrarySelect.appendChild(option);
  });

  // When user manually picks a library
  instrumentLibrarySelect.addEventListener('change', () => {
    const event = new CustomEvent('instrument-library-change', { detail: { preselect: null } });
    instrumentLibrarySelect.dispatchEvent(event);
  });
  
  // When library selection changes (either programmatic or manual)
  instrumentLibrarySelect.addEventListener('instrument-library-change', async (e: Event) => {
    const customEvent = e as CustomEvent<{ preselect: string | null }>;
    const selectedLibrary = instrumentLibrarySelect.value;
    const preselected = customEvent.detail?.preselect ?? null;
  
    try {
      let instruments: string[];
  
      if (selectedLibrary === 'mallets') {
        instruments = await getMalletInstruments();
      } else if (selectedLibrary === 'electricpiano') {
        instruments = await getElectricPianoInstruments();
      } else if (selectedLibrary === 'splendidgrandpiano') {
        instruments = await getSplendidGrandPianoInstruments();
      } else if (selectedLibrary === 'drummachines') {
        instruments = await getDrumMachineInstruments();
      } else if (selectedLibrary === 'smolken') {
        instruments = await getSmolkenInstruments();
      } else if (['fluidr3-gm', 'musyngkite', 'fatboy'].includes(selectedLibrary)) {
        const kitMap: Record<'fluidr3-gm' | 'fatboy' | 'musyngkite', string> = {
          'fluidr3-gm': 'FluidR3_GM',
          'fatboy': 'FatBoy',
          'musyngkite': 'MusyngKite'
        };
        instruments = await getSoundfontInstruments(kitMap[selectedLibrary as keyof typeof kitMap]);
      } else {
        const response = await fetch(`/static/${selectedLibrary}.json`);
        instruments = await response.json();
      }
  
      instrumentSelect.innerHTML = '';
  
      instruments.forEach(instrument => {
        const option = document.createElement('option');
        option.value = `${selectedLibrary}/${instrument}`;
        option.textContent = instrument
          .split('_')
          .map(word => word[0].toUpperCase() + word.slice(1))
          .join(' ');
        instrumentSelect.appendChild(option);
      });
  
      if (preselected) {
        instrumentSelect.value = preselected;
      } else if (instruments.length > 0) {
        instrumentSelect.value = `${selectedLibrary}/${instruments[0]}`;
      }
  
    } catch (err) {
      console.error(`Failed to load instruments for library: ${selectedLibrary}`, err);
    }
  });
  

  // Button to open the instrument select modal
  instrumentSelectBtn.addEventListener('click', async () => {
    const fullName = getActiveInstrumentName() || 'fluidr3-gm/acoustic_grand_piano';
    const [library] = fullName.split('/');

    instrumentLibrarySelect.value = library;

    const event = new CustomEvent('instrument-library-change', { detail: { preselect: fullName } });
    instrumentLibrarySelect.dispatchEvent(event);

    instrumentSelectModal.classList.remove('hidden');
    delete instrumentSelectModal.dataset.currentSequencer;
  });

  // Confirm selecting an instrument
  instrumentSelectConfirm.addEventListener('click', async () => {
    const selectedInstrument = instrumentSelect.value;
    instrumentSelectModal.classList.add('hidden');

    const seqIdRaw = instrumentSelectModal.dataset.currentSequencer;
    const seqId = seqIdRaw !== undefined ? parseInt(seqIdRaw, 10) : undefined;

    if (seqId !== undefined && !isNaN(seqId)) {
      const seq = getSequencerById(seqId);
      if (seq) {
        recordDiff(
          createSetInstrumentDiff(seq.id, selectedInstrument),
          createReverseSetInstrumentDiff(seq.id, seq.instrumentName)
        );
        seq.setInstrument(selectedInstrument);
      }
      instrumentSelectModal.dataset.currentSequencer = '';
    } else {
      try {
        await setActiveInstrument(selectedInstrument);
      } catch (err) {
        console.error('Failed to load global instrument:', selectedInstrument, err);
      }
    }
  });

  // Cancel button
  instrumentCancelBtn.addEventListener('click', () => {
    instrumentSelectModal.classList.add('hidden');
  });
}
