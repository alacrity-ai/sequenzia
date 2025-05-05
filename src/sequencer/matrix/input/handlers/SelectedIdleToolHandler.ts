// src/sequencer/matrix/input/handlers/SelectedIdleToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Note } from '../../../interfaces/Note.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';
import type { Clipboard } from '../../../interfaces/Clipboard.js';

import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { CursorState } from '../interfaces/CursorState.js';
import { getRelativeMousePos } from '../../utils/gridPosition.js';
import { getSnappedNotePosition } from '../../utils/snapPosition.js';
import { isNearNoteRightEdge } from '../../utils/isNearNoteEdge.js';
import { isNoteNearVisibleEdge } from '../../utils/isNoteNearVisibleEdge.js';

import { rowToNote } from '../../utils/noteUtils.js';
import { recordDiff } from '../../../../appState/appState.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../../appState/diffEngine/types/grid/deleteNotes.js';
import { NoteManager } from '../../notes/NoteManager.js';

export class SelectedIdleToolHandler implements GridInteractionHandler {
  private initialMouseX: number = 0;
  private initialMouseY: number = 0;
  private readonly dragThreshold: number = 10;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GridConfig,
    private readonly scroll: GridScroll,
    private readonly noteManager: NoteManager,
    private readonly store: InteractionStore,
    private readonly grid: GridSnappingContext,
    private readonly requestRedraw: () => void,
    private readonly getSequencerId: () => number, // ✅ add this
    private readonly controller: InteractionController,
    private readonly cursorController: CursorController,
    private readonly setClipboard: (notes: Note[]) => void,
    private readonly getClipboard: () => Clipboard
  ) {}  

  public onEnter(): void {
    // Cursor state or visual feedback if desired
  }

  public onExit(): void {
    this.store.setSnappedCursorGridPosition(null);
    this.store.setHoveredNoteKey(null);
    this.requestRedraw();
  }

  public onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || this.store.isOnNonGridElement()) return;
    this.store.beginSelectionDrag();
    this.initialMouseX = e.clientX;
    this.initialMouseY = e.clientY;
  }

  public onMouseMove(e: MouseEvent): void {
    if (this.store.isOnNonGridElement()) {
      this.store.setHoveredNoteKey(null);
      this.cursorController.set(CursorState.Default);
      this.requestRedraw();
      return;
    }
  
    const dx = e.clientX - this.initialMouseX;
    const dy = e.clientY - this.initialMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    if (this.store.isDraggingToSelect()) {
      const hoveredKey = this.store.getHoveredNoteKey();
  
      // If drag began over a hovered note — enter Dragging mode with current selection
      if (hoveredKey && distance >= this.dragThreshold) {
        this.store.endSelectionDrag();
        this.controller.transitionTo(InteractionMode.Dragging);
        return;
      }
  
      // Otherwise, drag began over empty space — retry marquee selection
      if (!hoveredKey && distance >= this.dragThreshold) {
        this.store.clearSelection();
        this.store.endSelectionDrag();
        this.controller.transitionTo(InteractionMode.Selecting);
        return;
      }
    }
  
    // Hover logic only — no snapped preview, no cursor indicator beyond hover
    const mouse = getRelativeMousePos(e, this.canvas);
    const snap = this.grid.getSnapResolution();
    const triplet = this.grid.isTripletMode();
    const snapped = getSnappedNotePosition(mouse, this.scroll, this.config, snap, triplet);
    if (!snapped) {
      this.store.setHoveredNoteKey(null);
      this.cursorController.set(CursorState.Default);
      this.requestRedraw();
      return;
    }
  
    // if (isNoteNearVisibleEdge(snapped, this.scroll, this.config, this.canvas)) {
    //   this.store.setHoveredNoteKey(null);
    //   this.cursorController.set(CursorState.Default);
    //   this.requestRedraw();
    //   return;
    // }
  
    const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);
    const note = this.noteManager.findAtPosition(pitch, snapped.x);
  
    if (note) {
      const key = `${note.pitch}:${note.start}`;
      this.store.setHoveredNoteKey(key);
      this.cursorController.set(CursorState.Pointer);
    } else {
      this.store.setHoveredNoteKey(null);
      this.cursorController.set(CursorState.Default);
    }
  
    this.requestRedraw();
  }  

  public onMouseUp(e: MouseEvent): void {
    if (e.button !== 0 || this.store.isOnNonGridElement()) return;

    this.store.endSelectionDrag();

    const hoveredKey = this.store.getHoveredNoteKey();
    if (hoveredKey) {
      const [pitch, start] = hoveredKey.split(':');
      const note = this.noteManager.findAtPosition(pitch, Number(start));
      if (note) {
        this.store.setSelectedNotes([note]);
        this.controller.transitionTo(InteractionMode.SelectedIdle);
        return;
      }
    }

    // Clicked on empty space — drop selection and return to default mode
    this.store.clearSelection();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }

  public onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    if (this.store.isOnNonGridElement()) return;
  
    const hoveredKey = this.store.getHoveredNoteKey();
    if (!hoveredKey) return;
  
    const [pitch, startStr] = hoveredKey.split(':');
    const start = parseFloat(startStr);
    const hoveredNote = this.noteManager.findAtPosition(pitch, start);
    if (!hoveredNote) return;
  
    const selected = this.store.getSelectedNotes();
    const isHoveredNoteSelected = selected.some(
      n => n.pitch === hoveredNote.pitch && n.start === hoveredNote.start
    );
  
    if (selected.length > 0 && isHoveredNoteSelected) {
      // Case 1: right-clicked on a selected note — delete all selected notes
      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), selected),
        createReverseDeleteNotesDiff(this.getSequencerId(), selected)
      );
    } else {
      // Case 2: right-clicked on a non-selected note — delete just it
      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), [hoveredNote]),
        createReverseDeleteNotesDiff(this.getSequencerId(), [hoveredNote])
      );
    }
  
    // In both cases: clear selection and revert to default mode
    this.store.clearSelection();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onKeyDown(e: KeyboardEvent): void {
    const selected = this.store.getSelectedNotes();
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
  
    // Copy
    if (isCmdOrCtrl && e.key === 'c') {
      if (selected.length) this.setClipboard(selected);
      return;
    }
  
    // Cut
    if (isCmdOrCtrl && e.key === 'x') {
      if (!selected.length) return;
  
      this.setClipboard(selected);
  
      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), selected),
        createReverseDeleteNotesDiff(this.getSequencerId(), selected)
      );
  
      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.DefaultNoteTool);
      return;
    }
  
    // Paste — only if clipboard has content
    if (isCmdOrCtrl && e.key === 'v') {
        const clipboard = this.getClipboard();
        if (!clipboard.notes.length) return;

        this.store.clearSelection();
        this.controller.transitionTo(InteractionMode.Pasting);
        return;
    }
  
    // Delete
    if (e.key === 'Delete') {
      if (!selected.length) return;
  
      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), selected),
        createReverseDeleteNotesDiff(this.getSequencerId(), selected)
      );
  
      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.DefaultNoteTool);
    }
  }  
}
