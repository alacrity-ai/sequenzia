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
    const octave = Math.floor(midi / 12); // subtract 1 because MIDI octaves start at -1
    const bands = ['#5f9ea0', '#4682b4', '#6a5acd', '#8a2be2', '#9932cc', '#ba55d3', '#da70d6', '#ff69b4'];
    return bands[octave % bands.length] || '#999';
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
