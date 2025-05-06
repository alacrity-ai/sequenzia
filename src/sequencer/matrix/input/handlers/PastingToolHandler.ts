// src/sequencer/matrix/input/handlers/PastingToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Clipboard } from '../../../interfaces/Clipboard.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';

import { transformPastedNotes } from '../../utils/transformPastedNotes.js';
import { abortIfOutOfGridBounds } from '../../utils/gridGuards.js';
import { getSnappedFromEvent } from '../../utils/snapping.js';
import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { CursorState } from '../interfaces/CursorState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../../appState/diffEngine/types/grid/placeNotes.js';
import { recordDiff } from '../../../../appState/appState.js';

export class PastingToolHandler implements GridInteractionHandler {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GridConfig,
    private readonly scroll: GridScroll,
    private readonly store: InteractionStore,
    private readonly grid: GridSnappingContext,
    private readonly requestRedraw: () => void,
    private readonly getSequencerId: () => number,
    private readonly controller: InteractionController,
    private readonly cursorController: CursorController,
    private readonly getClipboard: () => Clipboard,
  ) {}

  public onMouseMove(e: MouseEvent): void {
    const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
    if (!snapped) return;
    if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;
  
    const clipboard = this.getClipboard();
    if (!clipboard.notes.length) return;
  
    const { lowestMidi, highestMidi } = this.config.layout;
    const totalRows = highestMidi - lowestMidi + 1;
  
    const targetMidi = lowestMidi + (totalRows - 1 - snapped.y);
    const targetBeat = snapped.x;
  
    const preview = transformPastedNotes({
      notes: clipboard.notes,
      anchorBeat: clipboard.anchorBeat,
      anchorMidi: clipboard.anchorMidi,
      targetBeat,
      targetMidi,
      lowestMidi,
      highestMidi,
    });
  
    this.store.setPreviewNotes(preview);
    this.cursorController.set(CursorState.Pointer);
    this.requestRedraw();
  }

  public onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || this.store.isOnNonGridElement()) return;
  
    const notes = this.store.getPreviewNotes();
    if (!notes.length) return;
  
    recordDiff(
      createPlaceNotesDiff(this.getSequencerId(), notes),
      createReversePlaceNotesDiff(this.getSequencerId(), notes)
    );
  
    this.store.clearPreviewNotes();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onMouseLeave(): void {
    this.store.clearPreviewNotes();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onExit(): void {
    this.store.clearPreviewNotes();
    this.requestRedraw();
  }  
}
