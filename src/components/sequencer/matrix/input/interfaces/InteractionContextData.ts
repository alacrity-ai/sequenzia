// src/sequencer/matrix/input/interfaces/InteractionContextData.ts

import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';
import type { GridSnappingContext } from '@/components/sequencer/matrix/interfaces/GridSnappingContext.js';
import type { SequencerContext } from '@/components/sequencer/matrix/interfaces/SequencerContext.js';
import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { Clipboard } from '@/components/sequencer/interfaces/Clipboard.js';
import { NoteManager } from '@/components/sequencer/matrix/notes/NoteManager.js';

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
