// src/sequencer/matrix/utils/createSequencerInBody.ts

import { Note } from '../../interfaces/Note.js';
import { GridConfig } from '../interfaces/GridConfigTypes.js';
import { Grid } from '../Grid.js';

export function createGridInSequencerBody(
  container: HTMLElement,
  config: Partial<GridConfig>,
  notes: Note[]
): Grid {
  const grid = new Grid(container, config);
  grid.setNotes(notes);
  return grid;
}
