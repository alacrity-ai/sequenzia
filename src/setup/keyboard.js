import { getKeyMap } from '../keyboard/keys.js';
import { drawKeys } from '../keyboard/renderer.js';
import { attachInputListeners } from '../keyboard/interactions.js';
import { attachKeyboardListeners, detachKeyboardListeners } from '../keyboard/keyboard-interaction.js';
import { WHITE_KEYS, BLACK_KEYS } from '../keyboard/constants.js';
import { setActiveInstrument, getActiveInstrumentName } from '../sf2/sf2-player.js';
import { getSequencerById } from './sequencers.js';
import { getMalletInstruments, getDrumMachineInstruments, getSmolkenInstruments, getSoundfontInstruments, getElectricPianoInstruments, getSplendidGrandPianoInstruments } from '../sf2/sf2-loader.js';

let currentOctave = 3;
let keyMap = getKeyMap(currentOctave);
let keyboardInputEnabled = false;

export async function setupKeyboard(canvas) {
  const ctx = canvas.getContext('2d');
  
  // ✅ Load default instrument for virtual keyboard
  await setActiveInstrument('fluidr3-gm/acoustic_grand_piano');

  const whiteKeys = WHITE_KEYS;
  const blackKeys = BLACK_KEYS;

  function buildKeyToNoteMap() {
    const whiteNotes = Object.values(keyMap)
      .filter(k => !k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const blackNotes = Object.values(keyMap)
      .filter(k => k.isBlack)
      .sort((a, b) => a.x - b.x)
      .map(k => k.note);

    const map = {};
    whiteKeys.forEach((k, i) => { if (whiteNotes[i]) map[k] = whiteNotes[i]; });
    blackKeys.forEach((k, i) => { if (blackNotes[i]) map[k] = blackNotes[i]; });
    return map;
  }

  function refreshKeyboard() {
    keyMap = getKeyMap(currentOctave);
    const keyToNoteMap = keyboardInputEnabled ? buildKeyToNoteMap() : null;
    drawKeys(ctx, keyMap, new Set(), keyToNoteMap);
  }

  // Attach only mouse/touch input by default
  attachInputListeners(canvas, () => keyMap);
  refreshKeyboard();

  document.getElementById('octave-up').addEventListener('click', () => {
    if (currentOctave < 7) {
      currentOctave++;
      refreshKeyboard();
    }
  });

  document.getElementById('octave-down').addEventListener('click', () => {
    if (currentOctave > 1) {
      currentOctave--;
      refreshKeyboard();
    }
  });

  const toggleBtn = document.getElementById('disable-keyboard-inputs');
  toggleBtn.classList.remove('bg-purple-600');
  toggleBtn.classList.add('bg-gray-700'); // show disabled on load

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

  // Add instrument select modal handlers
  const instrumentSelectBtn = document.getElementById('instrument-select-btn');
  const instrumentSelectModal = document.getElementById('instrument-select-modal');
  const instrumentSelect = document.getElementById('instrument-select');
  const instrumentSelectConfirm = document.getElementById('instrument-select-confirm');
  const instrumentCancelBtn = document.getElementById('instrument-cancel-btn');
  const instrumentLibrarySelect = document.getElementById('instrument-library-select');

  const instrumentLibraries = {
    'fluidr3-gm': 'soundfont',
    'musyngkite': 'soundfont',
    'fatboy': 'soundfont',
    'splendidgrandpiano': 'builtin',
    'electricpiano': 'builtin',
    'mallets': 'builtin',
    'drummachines': 'builtin',
    'smolken': 'builtin'
  };
  

  // Populate the library dropdown dynamically
  Object.entries(instrumentLibraries).forEach(([key, _]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize
    instrumentLibrarySelect.appendChild(option);
  });

  instrumentLibrarySelect.addEventListener('change', async (e) => {
    const selectedLibrary = instrumentLibrarySelect.value;
    const instrumentSelect = document.getElementById('instrument-select');

    const preselected = e.detail?.preselect || null;

    try {
      let instruments;
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
        // Use getSoundfontInstruments for all soundfont libraries
        const kitMap = {
          'fluidr3-gm': 'FluidR3_GM',
          'fatboy': 'FatBoy',
          'musyngkite': 'MusyngKite'
        };
        instruments = await getSoundfontInstruments(kitMap[selectedLibrary]);
      } else {
        // For remaining libraries that still use JSON
        const response = await fetch(`/static/${selectedLibrary}.json`);
        instruments = await response.json();
      }

      // Clear current options
      instrumentSelect.innerHTML = '';

      // Populate new options
      instruments.forEach(instrument => {
        const option = document.createElement('option');
        option.value = `${selectedLibrary}/${instrument}`;
        option.textContent = instrument
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        instrumentSelect.appendChild(option);
      });

      // Set the selected instrument properly
      instrumentSelect.value = preselected || `${selectedLibrary}/${instruments[0]}`;
    } catch (err) {
      console.error(`Failed to load instruments for library: ${selectedLibrary}`, err);
    }
  });
  

  // Trigger the handler once on load to populate with the initial library
  instrumentLibrarySelect.dispatchEvent(new Event('change'));


  // Open modal for global piano keyboard
  instrumentSelectBtn.addEventListener('click', async () => {
    const fullName = getActiveInstrumentName() || 'fluidr3-gm/acoustic_grand_piano';
    const [library, instrument] = fullName.split('/');
  
    instrumentLibrarySelect.value = library;
  
    // Pass selected instrument via CustomEvent `detail`
    await instrumentLibrarySelect.dispatchEvent(new CustomEvent('change', {
      detail: { preselect: fullName }
    }));
  
    instrumentSelectModal.classList.remove('hidden');
    delete instrumentSelectModal.dataset.currentSequencer;
  });  

  // Open modal for sequencer track
  instrumentSelectConfirm.addEventListener('click', async () => {
    const selectedInstrument = instrumentSelect.value;
    instrumentSelectModal.classList.add('hidden');

    const seqIdRaw = instrumentSelectModal.dataset.currentSequencer;
    const seqId = seqIdRaw !== undefined ? parseInt(seqIdRaw, 10) : undefined;

    if (seqId !== undefined && !isNaN(seqId)) {
      console.log('[Modal] Looking up sequencer with id:', seqId);
      const seq = getSequencerById(seqId);
      console.log('[Modal] Lookup result:', seq);

      if (seq) {
        seq.setInstrument(selectedInstrument);
      }
      instrumentSelectModal.dataset.currentSequencer = ''; // cleanup
    } else {
      // Fall back to global keyboard instrument
      try {
        await setActiveInstrument(selectedInstrument);
      } catch (err) {
        console.error('Failed to load global instrument:', selectedInstrument, err);
      }
    }
  });

  // Loop toggle
  let sf2LoopEnabled = false;
  const loopToggle = document.getElementById('instrument-loop-toggle');
  loopToggle.addEventListener('change', () => {
    sf2LoopEnabled = loopToggle.checked;
    console.log('[UI] Loop mode:', sf2LoopEnabled);
  });
  
  // Handle cancel button
  instrumentCancelBtn.addEventListener('click', () => {
    instrumentSelectModal.classList.add('hidden');
  });
}

export function isKeyboardLoopEnabled() {
  return document.getElementById('instrument-loop-toggle')?.checked || false;
}

