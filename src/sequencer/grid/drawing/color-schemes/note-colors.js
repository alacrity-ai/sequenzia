// src/sequencer/grid/drawing/color-schemes/note-colors.js

import { PITCH_COLOR_MAP } from '../../helpers/constants.js';
import { pitchToMidi } from '../../helpers/geometry.js';

export const NOTE_COLOR_SCHEMES = {
  'Scriabin': (note, { getPitchClass }) => {
    const pc = getPitchClass(note.pitch);
    return PITCH_COLOR_MAP[pc] || '#999';
  },

  'Track Color': (note, { getTrackColor }) => {
    return getTrackColor?.(note.trackId) || '#999';
  },

    'Octave Bands': (note) => {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) return '#999';
    const hue = (midi * 3) % 360;
    return `hsl(${hue}, 100%, 60%)`;
    },


  'Pitch Class Contrast': (note, { getPitchClass }) => {
    const midi = pitchToMidi(note.pitch);
    const pitchClass = midi % 12;
    const contrastMap = [
      '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
      '#00ff00', '#00ff7f', '#00ffff', '#007fff',
      '#0000ff', '#7f00ff', '#ff00ff', '#ff007f'
    ];
    return contrastMap[pitchClass] || '#999';
  }
};
