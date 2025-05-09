// src/sequencer/matrix/input/interfaces/InteractionContextData.ts

import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { SequencerContext } from '../../interfaces/SequencerContext.js';
import type { CursorController } from '../cursor/CursorController.js';
import type { Note } from '../../../../shared/interfaces/Note.js';
import type { Clipboard } from '../../../interfaces/Clipboard.js';
import { NoteManager } from '../../notes/NoteManager.js';

export interface InteractionContextData {
  canvas: HTMLCanvasElement;
  noteManager: NoteManager;
  scroll: GridScroll;
  config: GridConfig;
  store: InteractionStore;
  grid: GridSnappingContext;
  addNote: (note: Note) => void;
  requestRedraw: () => void;
  sequencerContext: SequencerContext;
  cursorController: CursorController;
  setClipboard: (notes: Note[]) => void;
  getClipboard: () => Clipboard;
  playNoteAnimation: (note: Note) => void;
}
