// src/sequencer/matrix/input/handlers/SizingToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { NoteManager } from '../../notes/NoteManager.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';

import { CursorState } from '../interfaces/CursorState.js';
import { recordDiff } from '@/appState/appState.js';
import {
  createResizeNotesDiff,
  createReverseResizeNotesDiff
} from '@/appState/diffEngine/types/grid/resizeNotes.js';
import { InteractionMode } from '../interfaces/InteractionEnum.js';
import type { Note } from '@/shared/interfaces/Note.js';

export class SizingToolHandler implements GridInteractionHandler {
  private originalNotes: Note[] = [];
  private previewNotes: Note[] = [];
  private anchorNote: Note | null = null;
  private hasResized: boolean = false;
  private hasMoved: boolean = false;
  private initialMouseX: number = 0;
  private accumulatedDelta: number = 0; // total effective delta applied

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GridConfig,
    private readonly scroll: GridScroll,
    private readonly store: InteractionStore,
    private readonly noteManager: NoteManager,
    private readonly grid: GridSnappingContext,
    private readonly requestRedraw: () => void,
    private readonly controller: InteractionController,
    private readonly cursorController: CursorController,
    private readonly getSequencerId: () => number
  ) {}

  public onEnter(): void {
    const selected = this.store.getSelectedNotes();
    if (!selected.length) {
      this.controller.transitionTo(InteractionMode.NoteTool);
      return;
    }
  
    this.originalNotes = selected.map(n => ({ ...n }));
    const anchorKey = this.store.getHoveredNoteKey();
    this.anchorNote = anchorKey
      ? selected.find(n => `${n.pitch}:${n.start}` === anchorKey) ?? null
      : selected[0];
  
    this.noteManager.removeAll(selected);
    this.store.setPreviewNotes(this.originalNotes);
    this.hasResized = false;
    this.hasMoved = false;
    this.accumulatedDelta = 0;
    this.initialMouseX = this.controller.getLastMouseX(); // <- Track initial X
    this.requestRedraw();
  }
  

  public onMouseMove(e: MouseEvent): void {
    if (!this.anchorNote) return;
  
    const snap = this.grid.getSnapResolution();
    const triplet = this.grid.isTripletMode();
    const effectiveSnap = triplet ? snap * (2 / 3) : snap;
  
    const deltaPixels = e.clientX - this.initialMouseX;
    const cellWidth = this.config.layout.baseCellWidth * this.config.behavior.zoom;
    const snapPixelWidth = cellWidth * effectiveSnap;
  
    const rawUnits = deltaPixels / snapPixelWidth;
    const snappedUnits = Math.round(rawUnits);
  
    // Guard: no movement
    if (snappedUnits === this.accumulatedDelta) return;
  
    this.accumulatedDelta = snappedUnits;
    const snappedDelta = snappedUnits * effectiveSnap;
  
    const preview = this.originalNotes.map(note => {
      const newDuration = Math.max(effectiveSnap, note.duration + snappedDelta);
      return {
        ...note,
        duration: newDuration
      };
    });
  
    this.previewNotes = preview;
    this.store.setPreviewNotes(preview);
    this.cursorController.set(CursorState.ResizeHorizontal);
    this.hasResized = true;
    this.requestRedraw();
  }  

  public onMouseUp(e: MouseEvent): void {
    if (e.button !== 0 || !this.anchorNote || !this.hasResized) return;

    const original = this.originalNotes;
    const resized = this.previewNotes;

    const forwardDiff = resized.map((note, i) => ({
      pitch: note.pitch,
      start: note.start,
      newDuration: note.duration
    }));

    const reverseDiff = original.map((note, i) => ({
      pitch: note.pitch,
      start: note.start,
      oldDuration: note.duration
    }));

    recordDiff(
      createResizeNotesDiff(this.getSequencerId(), forwardDiff),
      createReverseResizeNotesDiff(this.getSequencerId(), reverseDiff)
    );

    this.store.clearPreviewNotes();
    this.store.clearSelection();
    this.controller.transitionTo(InteractionMode.NoteTool);
  }

  public onMouseLeave(): void {
    this.controller.transitionTo(InteractionMode.NoteTool);
  }

  public onExit(): void {
    if (!this.hasResized && this.originalNotes.length > 0) {
      for (const note of this.originalNotes) {
        this.noteManager.add(note);
      }
      this.noteManager.rebuildIndex();
    }

    this.originalNotes = [];
    this.previewNotes = [];
    this.anchorNote = null;
    this.store.clearPreviewNotes();
    this.store.clearSelection();
    this.requestRedraw();
  }
}
