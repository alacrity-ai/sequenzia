// src/sequencer/interfaces/HandlerContext.ts

import { Note } from './Note.js';
import { Grid } from './Grid.js';

export interface HandlerContext {
  sequencer: any;
  grid: Grid | null;
  config: any;
  notes: Note[];
  canvas: HTMLCanvasElement;
  animationCtx: CanvasRenderingContext2D | null;
  getCellHeight: () => number;
  getCellWidth: () => number;
  getCanvasPos: (e: MouseEvent) => { x: number, y: number };
  findNoteAt: (x: number, y: number) => Note | undefined;
  scheduleRedraw: () => void;
  getPitchFromRow: (row: number) => string;
  getPitchRow: (pitch: string) => number;
  getSnappedBeatFromX: (x: number) => number;
  updatePreview: (note: Note | null) => void;
  clearPreview: () => void;
  getSelectedNote: () => Note | null;
  setSelectedNote: (note: Note | null) => void;
  getSelectedNotes: () => Note[];
  setSelectedNotes: (notes: Note[]) => void;
  setHoveredNote: (note: Note | null) => void;
  onNotesChanged: () => void;
  setPastePreviewNotes?: (notes: Note[] | null) => void;
  getHighlightedNotes?: () => Note[];
  setHighlightedNotes?: (notes: Note[]) => void;
  selectionBox?: {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  } | null;
}
