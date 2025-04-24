import { sequencers } from './setup/sequencers.js';
import { drawMiniContour } from './sequencer/mini-contour.js';
import { toggleZoomControls } from './setup/sequencers.js';

/**
 * Collapses all sequencers in the UI (hides body, shows mini-contour).
 * This does not modify app state or record any undoable diffs.
 */
export function collapseAllSequencers() {
  for (const seq of sequencers) {
    const wrapper = seq.container;
    const body = wrapper.querySelector('.sequencer-body');
    const mini = wrapper.querySelector('canvas.mini-contour');
    const collapseIcon = wrapper.querySelector('.collapse-btn use');

    if (!body.classList.contains('hidden')) {
      body.classList.add('hidden');
      mini.classList.remove('hidden');
      collapseIcon?.setAttribute('href', '#icon-caret-up');
      toggleZoomControls(wrapper, false);
      drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
    }
  }
}

 export function pitchToMidi(pitch) {
    const match = pitch.match(/^([A-G]#?)(\d)$/);
    if (!match) return null;
    const [_, note, oct] = match;
    const semis = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
    return 12 + semis[note] + 12 * parseInt(oct, 10);
  }
  
  export function midiToPitch(midi) {
    const semis = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return semis[midi % 12] + (Math.floor(midi / 12) - 1);
  }
  
