// src/components/sequencer/matrix/input/interfaces/OverlayContextData.ts

import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';
import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';

export interface OverlayContextData {
  canvas: HTMLCanvasElement;
  scroll: GridScroll;
  config: GridConfig;
  sequencerConfig: SequencerConfig;
  requestRedraw: () => void;
  getSequencerId: () => number;
  cursorController: CursorController;
  store: InteractionStore;
}
