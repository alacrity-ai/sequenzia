// src/sequencer/matrix/input/interactions/PlaceNoteHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Note } from '../../../interfaces/Note.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';

import { getSnappedFromEvent, getRawBeatFromEvent } from '../../utils/snapping.js';
import { abortIfOutOfGridBounds } from '../../utils/gridGuards.js';
import { CursorState } from '../interfaces/CursorState.js';
import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { NoteManager } from '../../notes/NoteManager.js';
import { rowToNote } from '../../utils/noteUtils.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../../appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../../appState/diffEngine/types/grid/deleteNotes.js';
import { recordDiff } from '../../../../appState/appState.js';

export class DefaultNoteToolHandler implements GridInteractionHandler {
    private initialMouseX: number = 0;
    private initialMouseY: number = 0;
    private readonly dragThreshold: number = 10; // Set high for testing

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

    public onMouseDown(e: MouseEvent): void {
      if (e.button !== 0 || this.store.isOnNonGridElement()) return;
    
      const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
      if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;
    
      const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
      if (snapped) {
        const pitch = rowToNote(
          snapped.y,
          this.config.layout.lowestMidi,
          this.config.layout.highestMidi
        );
      
        const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);
        const hoveredKey = this.store.getHoveredNoteKey();
      
        if (edgeNote && hoveredKey === `${edgeNote.pitch}:${edgeNote.start}`) {
          this.store.setSelectedNotes([edgeNote]); // lock in single note for resizing
          this.controller.transitionTo(InteractionMode.Sizing);
          return;
        }
      }
    
      // Otherwise begin marquee selection
      this.store.beginSelectionDrag();
      this.initialMouseX = e.clientX;
      this.initialMouseY = e.clientY;
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
    
      // If a drag has started...
      if (this.store.isDraggingToSelect()) {
        const hoveredKey = this.store.getHoveredNoteKey();
    
        // FAST-TRACK: Drag started over an existing note — transition to Dragging
        if (hoveredKey && distance >= this.dragThreshold) {
          const [pitch, start] = hoveredKey.split(':');
          const note = this.noteManager.findAtPosition(pitch, Number(start));
          if (note) {
            this.store.setSelectedNotes([note]); // select it (safe to overwrite)
            this.store.endSelectionDrag(); // cleanup pending selection state
            this.controller.transitionTo(InteractionMode.Dragging);
            return;
          }
        }
    
        // Otherwise, begin marquee selection
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

    // Left click: Place a note, or select a note if over an existing note
    public onMouseUp(e: MouseEvent): void {
      if (e.button !== 0) return;

      if (this.store.isOnNonGridElement()) {
        this.store.setSnappedCursorGridPosition(null);
        this.store.setHoveredNoteKey(null);
        this.requestRedraw();
        return;
      }

      if (this.store.isDraggingToSelect()) {
        this.store.endSelectionDrag();
        // The drag was too small to start marquee — treat as click
      }

      // First: are we hovering over a note? Then select it instead of placing
      const hoveredKey = this.store.getHoveredNoteKey();
      if (hoveredKey) {
        const [pitch, start] = hoveredKey.split(':');
        const selectedNote = this.noteManager.findAtPosition(pitch, Number(start));
        if (selectedNote) {
          this.store.setSelectedNotes([selectedNote]);
          this.controller.transitionTo(InteractionMode.SelectedIdle);
          return;
        }
      }

      // Otherwise, try placing a new note
      const snapped = this.store.getSnappedCursorGridPosition();
      if (!snapped) return;

      const { layout } = this.config;
      const duration = this.grid.getNoteDuration();
      const pitch = rowToNote(snapped.y, layout.lowestMidi, layout.highestMidi);
      if (!pitch) return;

      const existing = this.noteManager.findAtPosition(pitch, snapped.x);
      if (existing) return; // Already a note at this spot — no duplicate

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

      // Play the note 
      this.noteManager.previewNote(pitch, duration);

      // Play the note animation
      this.playNoteAnimation({
        start: snapped.x,
        duration: duration,
        pitch,
        velocity: 100
      });      
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
      // Optional: change cursor/tool indicator
    }
    public onExit(): void {
      // Clear both preview and hovered note state
      this.store.setSnappedCursorGridPosition(null);
      this.store.setHoveredNoteKey(null);
      this.requestRedraw();
    }  
  }
