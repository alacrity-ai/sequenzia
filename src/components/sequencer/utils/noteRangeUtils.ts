// src/components/sequencer/utils/noteRangeUtils.ts

import { pitchToMidi, midiRangeBetween } from '@/shared/utils/musical/noteUtils.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';
import type { Note } from '@/shared/interfaces/Note.js';

export function validateNoteRange(low: string, high: string): [number, number] | null {
  const lowMidi = pitchToMidi(low);
  const highMidi = pitchToMidi(high);

  if (lowMidi === null || highMidi === null || lowMidi >= highMidi) {
    return null;
  }

  return [lowMidi, highMidi];
}

export function applyNoteRangeToConfig(config: SequencerConfig, low: string, high: string): void {
  config.noteRange = [low, high];
  config.visibleNotes = midiRangeBetween(high, low) + 1;
}

export function resizeNoteCanvases(
  canvases: HTMLCanvasElement[],
  visibleNotes: number,
  cellHeight: number
): void {
  const fullHeight = visibleNotes * cellHeight;
  canvases.forEach(canvas => {
    canvas.height = fullHeight;
    canvas.style.height = `${fullHeight}px`;
  });
}

export function clampNotesToRange(notes: Note[], lowMidi: number, highMidi: number, low: string, high: string): void {
  for (const note of notes) {
    const midi = pitchToMidi(note.pitch);
    if (midi === null) continue;
    if (midi < lowMidi) note.pitch = low;
    else if (midi > highMidi) note.pitch = high;
  }
}
