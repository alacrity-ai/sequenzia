// src/sequencer/matrix/input/interfaces/InteractionContextData.ts

import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { Note } from '../../../interfaces/Note.js';

export interface InteractionContextData {
  scroll: GridScroll;
  config: GridConfig;
  store: InteractionStore;
  grid: GridSnappingContext;
  addNote: (note: Note) => void;
  requestRedraw: () => void;
}
