// src/setup/setupKeyboard.ts

import { getKeyMap } from '../../keyboard/keys.js';
import { drawKeys } from '../../keyboard/renderer.js';
import { attachInputListeners } from '../../keyboard/interactions.js';
import { attachKeyboardListeners, detachKeyboardListeners } from '../../keyboard/keyboard-interaction.js';
import { WHITE_KEYS, BLACK_KEYS } from '../../keyboard/constants.js';
import { setActiveInstrument, getActiveInstrumentName } from '../../sf2/sf2-player.js';
import { getSequencerById } from '../sequencers.js';
import { getMalletInstruments, getDrumMachineInstruments, getSmolkenInstruments, getSoundfontInstruments, getElectricPianoInstruments, getSplendidGrandPianoInstruments } from '../../sf2/sf2-loader.js';
import { recordDiff } from '../../appState/appState.js';
import { createSetInstrumentDiff, createReverseSetInstrumentDiff } from '../../appState/diffEngine/types/sequencer/setInstrument.js';

import type { KeyMap } from '../../keyboard/keys.js'; // Assuming you have a KeyMap type (otherwise can define)

let currentOctave = 3;
let keyMap: KeyMap = getKeyMap(currentOctave);
let keyboardInputEnabled = false;

interface InstrumentLibraries {
  [libraryName: string]: 'soundfont' | 'builtin';
}

export async function setupKeyboard(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context for keyboard canvas.');

  await setActiveInstrument('fluidr3-gm/acoustic_grand_piano');

  const whiteKeys = WHITE_KEYS;
  const blackKeys = BLACK_KEYS;

  function buildKeyToNoteMap(): Record<string, string> {
    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const map: Record<string, string> = {};
    whiteKeys.forEach((k, i) => { if (whiteNotes[i]) map[k] = whiteNotes[i]; });
    blackKeys.forEach((k, i) => { if (blackNotes[i]) map[k] = blackNotes[i]; });
    return map;
  }

  function refreshKeyboard(): void {
    if (!ctx) return;
    keyMap = getKeyMap(currentOctave);
    const keyToNoteMap = keyboardInputEnabled ? buildKeyToNoteMap() : null;
    drawKeys(ctx, keyMap, new Set(), keyToNoteMap);
  }

  attachInputListeners(canvas, () => keyMap);
  refreshKeyboard();

  document.getElementById('octave-up')?.addEventListener('click', () => {
    if (currentOctave < 7) {
      currentOctave++;
      refreshKeyboard();
    }
  });

  document.getElementById('octave-down')?.addEventListener('click', () => {
    if (currentOctave > 1) {
      currentOctave--;
      refreshKeyboard();
    }
  });

  const toggleBtn = document.getElementById('disable-keyboard-inputs') as HTMLElement;
  toggleBtn.classList.remove('bg-purple-600');
  toggleBtn.classList.add('bg-gray-700');

  toggleBtn.addEventListener('click', () => {
    keyboardInputEnabled = !keyboardInputEnabled;

    if (keyboardInputEnabled) {
      attachKeyboardListeners(canvas, () => keyMap);
      toggleBtn.classList.remove('bg-gray-700');
      toggleBtn.classList.add('bg-purple-600');
    } else {
      detachKeyboardListeners();
      toggleBtn.classList.remove('bg-purple-600');
      toggleBtn.classList.add('bg-gray-700');
    }

    refreshKeyboard();
  });

  const instrumentSelectBtn = document.getElementById('instrument-select-btn') as HTMLElement;
  const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement;
  const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
  const instrumentSelectConfirm = document.getElementById('instrument-select-confirm') as HTMLElement;
  const instrumentCancelBtn = document.getElementById('instrument-cancel-btn') as HTMLElement;
  const instrumentLibrarySelect = document.getElementById('instrument-library-select') as HTMLSelectElement;

  const instrumentLibraries: InstrumentLibraries = {
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

  instrumentLibrarySelect.addEventListener('change', async (e: Event) => {
    const selectedLibrary = instrumentLibrarySelect.value;
    const preselected = (e as CustomEvent).detail?.preselect ?? null;

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
        if (selectedLibrary in kitMap) {
          instruments = await getSoundfontInstruments(kitMap[selectedLibrary as keyof typeof kitMap]);
        } else {
          console.warn(`[setupKeyboard] Unknown soundfont library: ${selectedLibrary}, using fallback.`);
          instruments = await getSoundfontInstruments('MusyngKite');
        }
      } else {
        const response = await fetch(`/static/${selectedLibrary}.json`);
        instruments = await response.json();
      }

      instrumentSelect.innerHTML = '';

      instruments.forEach(instrument => {
        const option = document.createElement('option');
        option.value = `${selectedLibrary}/${instrument}`;
        option.textContent = instrument.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        instrumentSelect.appendChild(option);
      });

      instrumentSelect.value = preselected || `${selectedLibrary}/${instruments[0]}`;
    } catch (err) {
      console.error(`Failed to load instruments for library: ${selectedLibrary}`, err);
    }
  });

  instrumentLibrarySelect.dispatchEvent(new Event('change'));

  instrumentSelectBtn.addEventListener('click', async () => {
    const fullName = getActiveInstrumentName() || 'fluidr3-gm/acoustic_grand_piano';
    const [library] = fullName.split('/');

    instrumentLibrarySelect.value = library;

    await instrumentLibrarySelect.dispatchEvent(new CustomEvent('change', {
      detail: { preselect: fullName }
    }));

    instrumentSelectModal.classList.remove('hidden');
    delete instrumentSelectModal.dataset.currentSequencer;
  });

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

  const loopToggle = document.getElementById('instrument-loop-toggle') as HTMLInputElement;
  loopToggle.addEventListener('change', () => {
    console.log('[UI] Loop mode:', loopToggle.checked);
  });

  instrumentCancelBtn.addEventListener('click', () => {
    instrumentSelectModal.classList.add('hidden');
  });
}

export function isKeyboardLoopEnabled(): boolean {
  return (document.getElementById('instrument-loop-toggle') as HTMLInputElement)?.checked || false;
}
