// src/sequencer/matrix/input/interactions/ExpressNoteToolHandler.ts

import type { GridInteractionHandler } from '@/components/sequencer/matrix/input/interfaces/GridInteractionHandler.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';
import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { GridSnappingContext } from '@/components/sequencer/matrix/interfaces/GridSnappingContext.js';
import type { InteractionController } from '@/components/sequencer/matrix/input/interfaces/InteractionController.js';
import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';

import { devLog } from '@/shared/state/devMode.js';
import { getSnappedFromEvent, getRawBeatFromEvent } from '@/components/sequencer/matrix/utils/snapping.js';
import { abortIfOutOfGridBounds } from '@/components/sequencer/matrix/utils/gridGuards.js';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState.js';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum.js';
import { NoteManager } from '@/components/sequencer/matrix/notes/NoteManager.js';
import { rowToNote } from '@/shared/utils/musical/noteUtils.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '@/appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '@/appState/diffEngine/types/grid/deleteNotes.js';
import { recordDiff } from '@/appState/appState.js';

export class ExpressNoteToolHandler implements GridInteractionHandler {
    private initialMouseX: number = 0;
    private initialMouseY: number = 0;
    private readonly dragThreshold: number = 3;
    
    constructor(
      private readonly canvas: HTMLCanvasElement,
      private readonly noteManager: NoteManager,
      private readonly scroll: GridScroll,
      private readonly config: GridConfig,
      private readonly store: InteractionStore,
      private readonly grid: GridSnappingContext,
      private readonly requestRedraw: () => void,
      private readonly getSequencerId: () => number,
      private readonly controller: InteractionController,
      private readonly cursorController: CursorController,
      private readonly getClipboard: () => { notes: Note[] },
      private readonly playNoteAnimation: (note: Note) => void
    ) {} 

    // Left click: Place a note if able
    public onMouseDown(e: MouseEvent): void {
      if (this.store.isOnNonGridElement()) return;

      if (e.button !== 0) {
        // Right click: Begin checking for intent to start marquee selection
        this.store.beginSelectionDrag();
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
      } else {
        // Left click: Place a note if able
        const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
        if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;
        if (!snapped) return;

        const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
        const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);
        if (!pitch) return;

        const hoveredNote = this.noteManager.findNoteUnderCursor(pitch, rawBeat);
        const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);

        if (edgeNote && hoveredNote && `${hoveredNote.pitch}:${hoveredNote.start}` === `${edgeNote.pitch}:${edgeNote.start}`) {
          this.store.setSelectedNotes([edgeNote]);
          this.controller.transitionTo(InteractionMode.Sizing);
          return;
        }

        if (hoveredNote) {
          this.noteManager.previewNote(hoveredNote.pitch, 0.25);
          this.store.setSelectedNotes([hoveredNote]);
          this.store.suppressNextMouseUpEvent();
          this.controller.transitionTo(InteractionMode.SelectedIdle);
          return;
        }

        // Place new note immediately and start counting down selectionDrag
        this.store.beginSelectionDrag();
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
        const duration = this.grid.getNoteDuration();
        const existing = this.noteManager.findAtPosition(pitch, snapped.x);
        if (existing) return;

        const newNote: Note = {
          start: snapped.x,
          duration,
          pitch,
          velocity: 100
        };

        recordDiff(
          createPlaceNotesDiff(this.getSequencerId(), [newNote]),
          createReversePlaceNotesDiff(this.getSequencerId(), [newNote])
        );

        this.noteManager.previewNote(pitch, duration);
        this.playNoteAnimation(newNote);
      }
    }

    public onMouseMove(e: MouseEvent): void {
      if (this.store.isOnNonGridElement()) {
        this.store.setSnappedCursorGridPosition(null);
        this.store.setHoveredNoteKey(null);
        this.requestRedraw();
        return;
      }

      const dx = e.clientX - this.initialMouseX;
      const dy = e.clientY - this.initialMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
    
      // If a drag has started, and we're holding down the left mouse button...
      if (e.buttons === 1 && this.store.isDraggingToSelect()) {
        const hoveredKey = this.store.getHoveredNoteKey();
    
        // FAST-TRACK: Drag started over an existing note — transition to sizing
        if (hoveredKey && distance >= this.dragThreshold) {
          const [pitch, start] = hoveredKey.split(':');
          const note = this.noteManager.findAtPosition(pitch, Number(start));
          if (note) {
            this.store.setSelectedNotes([note]); // select it (safe to overwrite)
            this.store.endSelectionDrag(); // cleanup pending selection state
            this.controller.transitionTo(InteractionMode.Sizing);
            return;
          }
        }
      }

      // If a drag has started, and we're holding down the right mouse button...
      if (e.buttons === 2 && this.store.isDraggingToSelect()) {
        const dx = e.clientX - this.initialMouseX;
        const dy = e.clientY - this.initialMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // Begin Marquee selection
        if (distance >= this.dragThreshold) {
          this.store.endSelectionDrag();
          this.controller.transitionTo(InteractionMode.Selecting);
          return;
        }
      }
    
      // Snap mouse to grid position
      const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
      if (!snapped) return;
      if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;

      // Always update snapped preview position
      this.store.setSnappedCursorGridPosition(snapped);
    
      // === Hover logic
      const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);

      // Use snapped beat for accurate note detection
      const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
      const hoveredNote = this.noteManager.findNoteUnderCursor(pitch, rawBeat);
      const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);

      // Hover expression and cursor logic
      if (hoveredNote) {
        const key = `${hoveredNote.pitch}:${hoveredNote.start}`;
        this.store.setHoveredNoteKey(key);
        this.store.setSnappedCursorGridPosition(null);

        if (edgeNote === hoveredNote) {
          this.cursorController.set(CursorState.ResizeHorizontal);
        } else {
          this.cursorController.set(CursorState.Pointer);
        }
      } else {
        this.store.setHoveredNoteKey(null);
        this.store.setSnappedCursorGridPosition(snapped);
        this.cursorController.set(CursorState.Default);
      }
    
      this.requestRedraw();
    }

    public onMouseUp(e: MouseEvent): void {
      this.store.endSelectionDrag();
    }

    // Right click: Delete note
    public onContextMenu(e: MouseEvent): void {
      e.preventDefault(); // Suppress native context menu

      if (this.store.isOnNonGridElement()) return;
    
      // Use hovered note key, not snapped position
      const hoveredKey = this.store.getHoveredNoteKey();
      if (!hoveredKey) return;
    
      const [pitch, startStr] = hoveredKey.split(':');
      const start = parseFloat(startStr);
      if (!pitch || isNaN(start)) return;
    
      const noteToDelete = this.noteManager.findAtPosition(pitch, start);
      if (!noteToDelete) return;
    
      recordDiff(
        createDeleteNotesDiff(this.getSequencerId(), [noteToDelete]),
        createReverseDeleteNotesDiff(this.getSequencerId(), [noteToDelete])
      );

      this.store.setLastDeletionTime();
    }
  
    public onMouseLeave(): void {
      this.store.setSnappedCursorGridPosition(null);
      this.store.setHoveredNoteKey(null);
      this.cursorController.set(CursorState.Default);
      this.requestRedraw();
    }    

    public onKeyDown(e: KeyboardEvent): void {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    
      if (isCmdOrCtrl && e.key === 'v') {
        const clipboard = this.getClipboard();
        if (!clipboard.notes.length) return;
    
        this.store.clearSelection();
        this.controller.transitionTo(InteractionMode.Pasting);
      }
    }
    
    public onEnter(): void {
      devLog('ExpressNoteToolHandler entered');
    }

    public onExit(): void {
      // Clear both preview and hovered note state
      this.store.setSnappedCursorGridPosition(null);
      this.store.setHoveredNoteKey(null);
      this.requestRedraw();
    }  
  }
