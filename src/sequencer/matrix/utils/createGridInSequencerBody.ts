// src/sequencer/matrix/utils/createSequencerInBody.ts

import { Note } from '../../interfaces/Note.js';
import { GridConfig } from '../interfaces/GridConfigTypes.js';
import { Grid } from '../Grid.js';
import { SequencerContext } from '../interfaces/SequencerContext.js';

export function createGridInSequencerBody(
  container: HTMLElement,
  config: Partial<GridConfig>,
  notes: Note[],
  playNote: (pitch: string, durationSec: number, velocity?: number, loop?: boolean) => Promise<null>
): Grid {
  const grid = new Grid(container, config, { playNote });
  grid.setNotes(notes);
  return grid;
}
