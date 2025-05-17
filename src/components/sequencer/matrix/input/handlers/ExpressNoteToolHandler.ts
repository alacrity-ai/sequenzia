// src/sequencer/matrix/input/interactions/ExpressNoteToolHandler.ts

import type { GridInteractionHandler } from '@/components/sequencer/matrix/input/interfaces/GridInteractionHandler.js';
import type { NoteManager } from '@/components/sequencer/matrix/notes/NoteManager.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';
import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { GridSnappingContext } from '@/components/sequencer/matrix/interfaces/GridSnappingContext.js';
import type { InteractionController } from '@/components/sequencer/matrix/input/interfaces/InteractionController.js';
import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';

import { devLog } from '@/shared/state/devMode.js';

// Grid system
import { getSnappedFromEvent, getRawBeatFromEvent } from '@/components/sequencer/matrix/utils/snapping.js';
import { abortIfOutOfGridBounds } from '@/components/sequencer/matrix/utils/gridGuards.js';
import { getRelativeMousePos } from '@/components/sequencer/matrix/utils/gridPosition';

// Music system
import { rowToNote } from '@/shared/utils/musical/noteUtils.js';
import { midiToPitch } from '@/shared/utils/musical/noteUtils.js';

// Input system
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState.js';
import { InteractionMode } from '@/components/sequencer/matrix/input/interfaces/InteractionEnum.js';

// Keybindings
import { matchesMacro } from '@/shared/keybindings/useKeyMacro.js';

// State system
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '@/appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '@/appState/diffEngine/types/grid/deleteNotes.js';
import { recordDiff } from '@/appState/appState.js';

export class ExpressNoteToolHandler implements GridInteractionHandler {
  private initialMouseX: number = 0;
  private initialMouseY: number = 0;
  private readonly dragThreshold: number = 1;
  
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
      return;
    }

    // Left click: Check if hovering a note (diatonic or non-diatonic)
    const hoveredKey = this.store.getHoveredNoteKey();
    if (hoveredKey) {
      const [pitch, startStr] = hoveredKey.split(':');
      const start = Number(startStr);

      const hoveredNote = this.noteManager.findAtPosition(pitch, start);
      if (hoveredNote) {
        const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
        const edgeNote = this.noteManager.findNoteEdgeAtCursor(pitch, rawBeat);

        if (edgeNote && hoveredNote.pitch === edgeNote.pitch && hoveredNote.start === edgeNote.start) {
          this.store.setSelectedNotes([edgeNote]);
          this.controller.transitionTo(InteractionMode.Sizing);
          return;
        }

        this.noteManager.previewNote(hoveredNote.pitch, 0.25);
        this.store.setSelectedNotes([hoveredNote]);
        this.store.suppressNextMouseUpEvent();
        this.controller.transitionTo(InteractionMode.SelectedIdle);
        return;
      }
    }

    // === No hovered note: Proceed to place a new note on snapped grid position ===
    const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
    if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;
    if (!snapped) return;

    const pitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);
    if (!pitch) return;

    const existing = this.noteManager.findAtPosition(pitch, snapped.x);
    if (existing) return; // Prevent duplicate notes at same position

    // Place new note immediately and start selection drag countdown
    this.store.beginSelectionDrag();
    this.initialMouseX = e.clientX;
    this.initialMouseY = e.clientY;

    const duration = this.grid.getNoteDuration();
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

    // === Handle selection drag initiated with left mouse button
    if (e.buttons === 1 && this.store.isDraggingToSelect()) {
      const hoveredKey = this.store.getHoveredNoteKey();

      // Determine snapped pitch for transition guard
      const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
      if (!snapped) return;
      if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;

      const snappedPitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);

      // FAST-TRACK: Only allow sizing if hovered note matches snapped pitch
      if (hoveredKey && distance >= this.dragThreshold) {
        const [pitch, start] = hoveredKey.split(':');
        if (pitch === snappedPitch) {
          const note = this.noteManager.findAtPosition(pitch, Number(start));
          if (note) {
            this.store.setSelectedNotes([note]); // safe overwrite
            this.store.endSelectionDrag();
            this.controller.transitionTo(InteractionMode.Sizing);
            return;
          }
        }
      }
    }

    // === Handle marquee selection drag with right mouse button
    if (e.buttons === 2 && this.store.isDraggingToSelect()) {
      if (distance >= this.dragThreshold) {
        this.store.endSelectionDrag();
        this.controller.transitionTo(InteractionMode.Selecting);
        return;
      }
    }

    // === Snap to grid for preview placement
    const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
    if (!snapped) return;
    if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;

    this.store.setSnappedCursorGridPosition(snapped);

    // === Raw hover detection (bypasses snap-to-key limitation)
    const rawMouse = getRelativeMousePos(e, this.canvas);
    const {
      layout: { headerHeight, baseCellWidth, verticalCellRatio, highestMidi, lowestMidi },
      behavior: { zoom }
    } = this.config;

    const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
    const totalRows = highestMidi - lowestMidi + 1;

    let rawRowY = Math.floor((rawMouse.y + this.scroll.getY() - headerHeight) / cellHeight);
    rawRowY = Math.max(0, Math.min(rawRowY, totalRows - 1));

    const rawPitchMidi = highestMidi - rawRowY;
    const rawPitchName = midiToPitch(rawPitchMidi);

    const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
    const hoveredNote = this.noteManager.findNoteUnderCursor(rawPitchName, rawBeat);
    const edgeNote = this.noteManager.findNoteEdgeAtCursor(rawPitchName, rawBeat);

    // === Hover expression and cursor state
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
    if (matchesMacro(e, 'PasteNotes')) {
      const clipboard = this.getClipboard();
      if (!clipboard.notes.length) return;

      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.Pasting);

      e.preventDefault();
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
