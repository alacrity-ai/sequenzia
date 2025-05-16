// src/sequencer/matrix/input/handlers/SelectedIdleToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';
import type { Clipboard } from '../../../interfaces/Clipboard.js';

import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { CursorState } from '../interfaces/CursorState.js';
import { getRelativeMousePos } from '../../utils/gridPosition.js';
import { getSnappedNotePosition } from '../../utils/snapPosition.js';
import { getRawBeatFromEvent, getSnappedFromEvent } from '../../utils/snapping.js';
import { matchesMacro } from '@/shared/keybindings/useKeyMacro.js';
import { rowToNote } from '@/shared/utils/musical/noteUtils.js';
import { recordDiff } from '@/appState/appState.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '@/appState/diffEngine/types/grid/deleteNotes.js';
import { NoteManager } from '../../notes/NoteManager.js';

export class ExpressSelectedIdleToolHandler implements GridInteractionHandler {
  private initialMouseX: number = 0;
  private initialMouseY: number = 0;
  private readonly dragThreshold: number = 3;

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
    // If we're entering due to a click on a note with mouse still held, prepare for drag
    if (window && (window.event as MouseEvent)?.buttons & 1) {
      this.store.beginSelectionDrag();
      const e = window.event as MouseEvent;
      this.initialMouseX = e.clientX;
      this.initialMouseY = e.clientY;
    }
  }

  public onExit(): void {
    this.store.setSnappedCursorGridPosition(null);
    this.store.setHoveredNoteKey(null);
    this.requestRedraw();
  }

  public onMouseDown(e: MouseEvent): void {
    if (this.store.isOnNonGridElement()) return;

    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;

    const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
    if (!snapped) {
      if (isRightClick) {
        // Can't snap, but still allow marquee drag
        this.beginSelectionDrag(e);
      }
      return;
    }

    const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);
    if (!pitch) {
      if (isRightClick) {
        this.beginSelectionDrag(e);
      }
      return;
    }

    const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
    const hoveredNote = this.noteManager.findNoteUnderCursor(pitch, rawBeat);

    if (isLeftClick) {
      const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);

      // === Edge resize
      if (edgeNote) {
        const hoveredKey = `${edgeNote.pitch}:${edgeNote.start}`;
        const selectedKeys = new Set(
          this.store.getSelectedNotes().map(n => `${n.pitch}:${n.start}`)
        );

        if (!selectedKeys.has(hoveredKey)) {
          this.store.setSelectedNotes([edgeNote]);
        }

        this.controller.transitionTo(InteractionMode.Sizing);
        return;
      }

      // === Prepare for dragging
      if (hoveredNote) {
        this.beginSelectionDrag(e);
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
      }
    }

    if (isRightClick) {
      if (hoveredNote) {
        const key = `${hoveredNote.pitch}:${hoveredNote.start}`;
        this.store.setHoveredNoteKey(key);
      } else {
        this.store.setHoveredNoteKey(null);
        this.beginSelectionDrag(e);
      }
    }
  }

  private beginSelectionDrag(e: MouseEvent): void {
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
  
    if (this.store.isDraggingToSelect() && e.buttons & 1) {
      const hoveredKey = this.store.getHoveredNoteKey();
  
      // Drag handling
      if (hoveredKey && distance >= this.dragThreshold) {
        const [pitch, startStr] = hoveredKey.split(':');
        const start = parseFloat(startStr);
        const hoveredNote = this.noteManager.findAtPosition(pitch, start);
      
        if (!hoveredNote) return;
      
        const selected = this.store.getSelectedNotes();
        const isHoveredNoteSelected = selected.some(
          n => n.pitch === hoveredNote.pitch && n.start === hoveredNote.start
        );
      
        if (!isHoveredNoteSelected) {
          this.store.setSelectedNotes([hoveredNote]);
        }
      
        this.store.setDragAnchorNoteKey(`${hoveredNote.pitch}:${hoveredNote.start}`);
        this.store.endSelectionDrag();
        this.controller.transitionTo(InteractionMode.Dragging);
        return;
      }
    } else if (this.store.isDraggingToSelect() && e.buttons & 2) {
      const hoveredKey = this.store.getHoveredNoteKey();

      // Otherwise, drag began over empty space — retry marquee selection
      if (!hoveredKey && distance >= this.dragThreshold) {
        if (!e.metaKey && !e.shiftKey && !e.ctrlKey) {
          this.store.clearSelection();
        }
        this.store.endSelectionDrag();
        this.controller.transitionTo(InteractionMode.Selecting);
        return;
      }
    }
  
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
  
    const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
    const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);
    const hoveredNote = this.noteManager.findNoteUnderCursor(pitch, rawBeat);
    const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);
  
    if (hoveredNote) {
      const key = `${hoveredNote.pitch}:${hoveredNote.start}`;
      this.store.setHoveredNoteKey(key);
  
      if (edgeNote && edgeNote === hoveredNote) {
        this.cursorController.set(CursorState.ResizeHorizontal);
      } else {
        this.cursorController.set(CursorState.Pointer);
      }
    } else {
      this.store.setHoveredNoteKey(null);
      this.cursorController.set(CursorState.Default);
    }
  
    this.requestRedraw();
  }    

  public onMouseUp(e: MouseEvent): void {
    if (e.button !== 0 || this.store.isOnNonGridElement()) return;
    e.stopPropagation();

    if (this.store.consumeSuppressMouseUpFlag()) {
      // Suppress this mouseup — already handled on mousedown
      return;
    }

    this.store.endSelectionDrag();
  
    const noteAtPosition = this.noteManager.findNoteAtMousePosition(
      e,
      this.canvas,
      this.scroll,
      this.config,
      this.noteManager
    );
  
    if (noteAtPosition) {
      const key = `${noteAtPosition.pitch}:${noteAtPosition.start}`;
      const selected = this.store.getSelectedNotes();
      const isAlreadySelected = selected.some(n => `${n.pitch}:${n.start}` === key);
  
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCtrlHeld = isMac ? e.metaKey : e.ctrlKey;
  
      if (isCtrlHeld) {
        if (isAlreadySelected) {
          // Remove the note from selection
          const newSelection = selected.filter(n => `${n.pitch}:${n.start}` !== key);
          this.store.setSelectedNotes(newSelection);
        } else {
          // Add the note to selection
          this.noteManager.previewNote(noteAtPosition.pitch, 0.25);
          this.store.setSelectedNotes([...selected, noteAtPosition]);
        }
        this.requestRedraw();
        return;
      }
  
      // Regular left-click: replace selection with just this note
      this.store.setSelectedNotes([noteAtPosition]);
      this.noteManager.previewNote(noteAtPosition.pitch, 0.25);
      this.requestRedraw();
      return;
    }
  
    // Clicked on empty space — drop selection and return to default mode
    this.store.clearSelection();
    this.controller.transitionTo(InteractionMode.NoteTool);
  }
  

  public onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    if (this.store.isOnNonGridElement()) return;
  
    const hoveredKey = this.store.getHoveredNoteKey();
    if (!hoveredKey) return;
  
    const [pitch, startStr] = hoveredKey.split(':');
    const start = parseFloat(startStr);
    const hoveredNote = this.noteManager.findNoteUnderCursor(pitch, start);
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
    this.controller.transitionTo(InteractionMode.NoteTool);
  }  

  public onKeyDown(e: KeyboardEvent): void {
    const selected = this.store.getSelectedNotes();

    // Copy
    if (matchesMacro(e, 'CopyNotes')) {
      if (selected.length) this.setClipboard(selected);
      e.preventDefault();
      return;
    }

    // Cut
    if (matchesMacro(e, 'CutNotes')) {
      if (!selected.length) return;

      this.setClipboard(selected);

      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), selected),
        createReverseDeleteNotesDiff(this.getSequencerId(), selected)
      );

      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.NoteTool);

      e.preventDefault();
      return;
    }

    // Paste
    if (matchesMacro(e, 'PasteNotes')) {
      const clipboard = this.getClipboard();
      if (!clipboard.notes.length) return;

      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.Pasting);

      e.preventDefault();
      return;
    }

    // Delete
    if (matchesMacro(e, 'DeleteNotes')) {
      if (!selected.length) return;

      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), selected),
        createReverseDeleteNotesDiff(this.getSequencerId(), selected)
      );

      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.NoteTool);

      e.preventDefault();
    }
  }
}
