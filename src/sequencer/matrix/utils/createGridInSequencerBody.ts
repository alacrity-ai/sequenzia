// src/sequencer/matrix/utils/createSequencerInBody.ts

import { GridConfig } from '../interfaces/GridConfigTypes.js';
import { Grid } from '../Grid.js';
import type { SequencerContext } from '../interfaces/SequencerContext.js';

export function createGridInSequencerBody(
  container: HTMLElement,
  config: Partial<GridConfig>,
  sequencerContext: SequencerContext
): Grid {
  console.log('Grid createated in sequencer body with context: ', sequencerContext);
  return new Grid(container, config, sequencerContext);
}
