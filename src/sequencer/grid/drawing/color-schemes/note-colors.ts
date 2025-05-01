// src/sequencer/grid/drawing/color-schemes/note-colors.ts

import { PITCH_COLOR_MAP } from '../../helpers/constants.js';
import { hexToHSL } from '../utility/colorConversion.js';
import { pitchToMidi } from '../../../../sounds/audio/pitch-utils.js';
import { Note } from '../../../interfaces/Note.js';

export interface NoteContext {
  getPitchClass?: (pitch: string) => number;
  getTrackColor?: () => string;
}

type NoteColorFunction = (note: Note, context?: NoteContext) => string;

export const NOTE_COLOR_SCHEMES: Record<string, NoteColorFunction> = {
  'Scriabin': (note, { getPitchClass }: NoteContext = {}) => {
    const pc = getPitchClass ? getPitchClass(note.pitch) : 0;
    return PITCH_COLOR_MAP[pc] || '#999';
  },

  'Track Color': (_note: Note, { getTrackColor }: NoteContext = {}) => {
    return getTrackColor?.() || '#999';
  },
  
  'Note Velocity': (note: Note, { getTrackColor }: NoteContext = {}) => {
    const velocity = note.velocity ?? 100; // default if undefined
    const base = getTrackColor?.() || '#ff0000'; // fallback color

    // Convert base hex to HSL for brightness manipulation
    const hsl = hexToHSL(base);
    if (!hsl) return '#999';

    const scaledLightness = 10 + (velocity / 127) * 50; // 10%–60% lightness
    return `hsl(${hsl.h}, ${hsl.s}%, ${scaledLightness}%)`;
  },


  'Octave Bands': (note: Note) => {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) return '#999';
    const hue = (midi * 3) % 360;
    return `hsl(${hue}, 100%, 60%)`;
  },

  'Pitch Class Contrast': (note: Note, { getPitchClass }: NoteContext = {}) => {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) return '#999'; // Safeguard against null
  
    const pitchClass = midi % 12;
    const contrastMap = [
      '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
      '#00ff00', '#00ff7f', '#00ffff', '#007fff',
      '#0000ff', '#7f00ff', '#ff00ff', '#ff007f'
    ];
    return contrastMap[pitchClass] || '#999';
  }  
};
