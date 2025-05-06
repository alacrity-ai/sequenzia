// src/sequencer/matrix/input/interactions/MoveNotes.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { NoteManager } from '../../notes/NoteManager.js';
import type { Note } from '../../../interfaces/Note.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';

import { transformDraggedNotes } from '../../utils/transformDraggedNotes.js';
import { CursorState } from '../interfaces/CursorState.js';
import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { getRelativeMousePos } from '../../utils/gridPosition.js';
import { getSnappedNotePosition } from '../../utils/snapPosition.js';
import { rowToNote, noteToMidi, midiToPitch } from '../../utils/noteUtils.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../../appState/diffEngine/types/grid/moveNotes.js';
import { recordDiff } from '../../../../appState/appState.js';

export class DraggingToolHandler implements GridInteractionHandler {
  private originalNotes: Note[] = [];
  private anchorNote: Note | null = null;
  private hasMoved: boolean = false;

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
      this.controller.transitionTo(InteractionMode.DefaultNoteTool);
      return;
    }
  
    this.originalNotes = selected.map(n => ({ ...n }));
  
    const anchorKey = this.store.getDragAnchorNoteKey();
    const anchor = anchorKey
      ? selected.find(n => `${n.pitch}:${n.start}` === anchorKey)
      : selected[0];
  
    this.anchorNote = anchor ?? selected[0];
  
    this.noteManager.removeAll(selected);
    this.store.setPreviewNotes(this.originalNotes);
    this.hasMoved = false;
    this.requestRedraw();
  }  

  public onMouseMove(e: MouseEvent): void {
    const mouse = getRelativeMousePos(e, this.canvas);
    const snap = this.grid.getSnapResolution();
    const triplet = this.grid.isTripletMode();
    const snapped = getSnappedNotePosition(mouse, this.scroll, this.config, snap, triplet);
    if (!snapped || !this.anchorNote) return;
  
    const { layout } = this.config;
    const pitch = rowToNote(snapped.y, layout.lowestMidi, layout.highestMidi);
    if (!pitch) return;
  
    const preview = transformDraggedNotes({
      originalNotes: this.originalNotes,
      anchorNote: this.anchorNote,
      targetPitch: pitch,
      targetBeat: snapped.x,
      lowestMidi: layout.lowestMidi,
      highestMidi: layout.highestMidi,
    });
  
    this.store.setPreviewNotes(preview);
    this.hasMoved = true;
    this.cursorController.set(CursorState.Grabbing);
    this.requestRedraw();
  }

  public onMouseUp(e: MouseEvent): void {
    if (e.button !== 0 || !this.anchorNote) return;

    const finalNotes = this.store.getPreviewNotes();
    const hasChanged =
      this.hasMoved &&
      finalNotes.some((n, i) =>
        n.start !== this.originalNotes[i].start || n.pitch !== this.originalNotes[i].pitch
      );

    if (hasChanged) {
      recordDiff(
        createMoveNotesDiff(this.getSequencerId(), this.originalNotes, finalNotes),
        createReverseMoveNotesDiff(this.getSequencerId(), this.originalNotes, finalNotes)
      );
    } else {
      // Restore original if no effective change
      for (const note of this.originalNotes) {
        this.noteManager.add(note);
      }
    }

    this.store.clearPreviewNotes();
    this.store.clearSelection();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }

  public onMouseLeave(): void {
    // Fake that a drag never ocurred, as we have left the grid
    this.hasMoved = false;
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }

  public onExit(): void {
    if (!this.hasMoved && this.originalNotes.length > 0) {
      // Restore original notes if drag never occurred
      for (const note of this.originalNotes) {
        this.noteManager.add(note);
      }
      // Update the index to avoid stale references
      this.noteManager.rebuildIndex();
    }
  
    this.originalNotes = [];
    this.anchorNote = null;
    this.store.clearPreviewNotes();
    this.store.clearSelection();
    this.store.setDragAnchorNoteKey(null);
    this.requestRedraw();
  }
  
}
