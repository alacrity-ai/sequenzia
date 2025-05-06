// src/sequencer/matrix/rendering/colors/noteColorSchemes.ts

import { hexToHSL } from '../../../../shared/utils/visual/colorConversion.js';
import { pitchToMidi } from '../../../../shared/utils/musical/noteUtils.js';
import { Note } from '../../../../shared/interfaces/Note.js';
import { SCRIABIN_COLOR_MAP } from './constants/pitchColorMap.js';

import type { NoteColorContext, NoteColorFunction } from './interfaces/NoteColorContext.js';

/**
 * Apply velocity-based brightness scaling to a hex color.
 */
function applyVelocityBrightness(hex: string, velocity: number | undefined): string {
  const hsl = hexToHSL(hex);
  if (!hsl) return '#999';

  const vel = velocity ?? 100;
  const lightness = 10 + (vel / 127) * 50; // 10–60% lightness
  return `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`;
}

/**
 * Factory to wrap any base color function with velocity brightness scaling.
 */
function withVelocityBrightness(baseFn: NoteColorFunction): NoteColorFunction {
  return (note, context) => {
    const baseColor = baseFn(note, context);
    return applyVelocityBrightness(baseColor, note.velocity);
  };
}

// Function to generate octave bands color
function octaveBandsColor(note: Note): string {
  const midi = pitchToMidi(note.pitch);
  if (midi == null) return '#999';

  const hue = (midi * 3) % 360;

  // Fixed color structure
  const saturation = 100;
  const lightness = 60;

  // Velocity mapped to alpha (opacity): 0.2 to 1.0
  const velocity = note.velocity ?? 100;
  const alpha = 0.2 + (velocity / 127) * 0.8;

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

export const NOTE_COLOR_SCHEMES: Record<string, NoteColorFunction> = {
  'Scriabin': withVelocityBrightness((note, { getPitchClass }: NoteColorContext = {}) => {
    const pc = getPitchClass ? getPitchClass(note.pitch) : 0;
    return SCRIABIN_COLOR_MAP[pc] || '#999';
  }),

  'Track Color': withVelocityBrightness((_note, { getTrackColor }: NoteColorContext = {}) => {
    return getTrackColor?.() || '#999';
  }),

  'Note Velocity': withVelocityBrightness((_note, { getTrackColor }: NoteColorContext = {}) => {
    return getTrackColor?.() || '#ff0000';
  }),

  'Octave Bands': octaveBandsColor,

  'Pitch Class Contrast': withVelocityBrightness((note: Note, { getPitchClass }: NoteColorContext = {}) => {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) return '#999';
    const pitchClass = midi % 12;

    const contrastMap = [
      '#ff0000', '#ff7f00', '#ffff00', '#7fff00',
      '#00ff00', '#00ff7f', '#00ffff', '#007fff',
      '#0000ff', '#7f00ff', '#ff00ff', '#ff007f'
    ];
    return contrastMap[pitchClass] || '#999';
  }),
};
