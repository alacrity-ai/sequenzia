// src/components/sequencer/services/rangeUpdateService.ts

import { pitchToMidi, midiRangeBetween } from '@/shared/utils/musical/noteUtils.js';
import { drawMiniContour } from '@/components/sequencer/renderers/drawMiniContour.js';
import { DRUM_MIDI_TO_NAME } from '@/sounds/loaders/constants/drums.js';
import type { Grid } from '@/components/sequencer/matrix/Grid.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';

interface RangeUpdateContext {
  config: SequencerConfig;
  container: HTMLElement | null;
  matrix: Grid;
  instrumentName: string;
  colorIndex: number;
  getNotes(): Note[];
}

export function updateNoteRange(context: RangeUpdateContext, range: [string, string]): void {
  const { config, container, matrix, colorIndex, getNotes } = context;
  const [lowNote, highNote] = range;
  const lowMidi = pitchToMidi(lowNote);
  const highMidi = pitchToMidi(highNote);

  if (lowMidi === null || highMidi === null) {
    console.warn(`Invalid note range: ${range}`);
    return;
  }

  if (lowMidi >= highMidi) {
    console.warn(`Invalid note range: low note must be lower than high note`);
    return;
  }

  config.noteRange = range;
  config.visibleNotes = midiRangeBetween(highNote, lowNote) + 1;

  const miniCanvas = container?.querySelector('.mini-contour') as HTMLCanvasElement;
  if (miniCanvas) {
    drawMiniContour(miniCanvas, getNotes(), config, colorIndex);
  }

  matrix.setNoteRange(lowMidi, highMidi);
}

export function updateToDrumNoteRange(context: RangeUpdateContext): void {
  const isDrumKit = context.instrumentName.toLowerCase().includes('drum kit');

  if (!isDrumKit) {
    updateNoteRange(context, ['A0', 'C9']);
    context.matrix.setCustomLabels(null);
  } else {
    updateNoteRange(context, ['B1', 'A5']);
    context.matrix.setCustomLabels(DRUM_MIDI_TO_NAME);
  }
}
