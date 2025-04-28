// src/sequencer/grid/interaction/noteModeMouseHandlers.js

import { pitchToMidi, midiToPitch } from '../../../audio/pitch-utils.js';
import { getSnapResolution, getTotalBeats } from '../../transport.js';
import { enterTemporarySelectMode, setSuppressNextNotePlacement, shouldSuppressNotePlacement, clearSuppressNotePlacementFlag } from '../../../setup/stores/editModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';
import { createResizeNotesDiff, createReverseResizeNotesDiff } from '../../../appState/diffEngine/types/grid/resizeNotes.js';
import { registerPotentialDragStart, hasCrossedDragThreshold, resetMouseGestureState, interceptPasteClickIfActive, updatePastePreview, clearPastePreviewIfNeeded } from './sharedMouseListeners.js';
import { registerSelectionStart } from '../../../setup/stores/selectionTracker.js';
import { animateNotePlacement } from '../animation/notePlacementAnimation.js';
import { animateNoteDeletion } from '../animation/noteDeleteAnimation.js';
import { labelWidth } from '../helpers/constants.js';
import { startResizeMode, clearResizeState, getResizeState, setHoveredResizeNote, clearHoveredResizeNote, getHoveredResizeNote } from './sharedMouseListeners.js';
import { isOnResizeHandle } from '../helpers/resize-note.js';

import type { HandlerContext } from '../../interfaces/HandlerContext.js';
import type { MouseHandler } from '../../interfaces/MouseHandler.js';
import type { Note } from '../../interfaces/Note.js';
import type { DragState } from '../../interfaces/DragState.js';

export function getNotePlacementHandlers(ctx: HandlerContext): MouseHandler {
  let dragState: DragState | null = null;
  let lastPlayedPitch: string | null = null;
  let hasActivatedMarquee = false;

  // Left click to place a note
  function clickHandler(e: MouseEvent): void {
    console.log('ClickHandler called');
    registerSelectionStart(ctx.grid!);

    // If we're suppressing note placement, clear the flag and avoid placing
    if (shouldSuppressNotePlacement()) {
      clearSuppressNotePlacementFlag();
      ctx.scheduleRedraw();
      return;
    }

    const { x, y } = ctx.getCanvasPos(e);

    // If clicking on the label area (outside grid), just play the note
    if (x < 0) {
      const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
      ctx.sequencer.playNote(pitch, 0.5);
      return;
    }

    const snappedBeat = ctx.getSnappedBeatFromX(x);
    const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const totalBeats = getTotalBeats();

    if (snappedBeat + ctx.config.currentDuration > totalBeats) return;

    // Prevent duplicate placement at same location
    const alreadyExists = ctx.notes.some(n => n.pitch === pitch && n.start === snappedBeat);
    if (alreadyExists) return;

    // Play the note and place it
    ctx.sequencer.playNote(pitch, 0.5);
    const newNote: Note = {
      pitch,
      start: snappedBeat,
      duration: ctx.config.currentDuration
    };

    recordDiff(
      createPlaceNotesDiff(ctx.sequencer.id, [newNote]),
      createReversePlaceNotesDiff(ctx.sequencer.id, [newNote])
    );

    ctx.setSelectedNote(null);

    animateNotePlacement(ctx, newNote, {
      getPitchRow: ctx.getPitchRow,
      cellWidth: ctx.getCellWidth(),
      cellHeight: ctx.getCellHeight(),
      labelWidth
    });

    ctx.scheduleRedraw();
    ctx.onNotesChanged?.();
  }

  // Right click to delete a note
  function contextHandler(e: MouseEvent): void {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const found = ctx.findNoteAt(x, y);
    if (!found) return;

    const idx = ctx.notes.indexOf(found);
    if (idx === -1) return;

    animateNoteDeletion(ctx, found, {
      getPitchRow: ctx.getPitchRow,
      cellWidth: ctx.getCellWidth(),
      cellHeight: ctx.getCellHeight(),
      labelWidth
    });

    const toDelete: Note[] = [found];

    recordDiff(
      createDeleteNotesDiff(ctx.sequencer.id, toDelete),
      createReverseDeleteNotesDiff(ctx.sequencer.id, toDelete)
    );

    clearSuppressNotePlacementFlag();
    ctx.setSelectedNote(null);
    ctx.scheduleRedraw();
  }

  function downHandler(e: MouseEvent): void {
    if (interceptPasteClickIfActive(ctx, e)) return;

    const { x, y } = ctx.getCanvasPos(e);

    const note = ctx.findNoteAt(x, y);

    const hoveredResize = getHoveredResizeNote();
    if (hoveredResize && isOnResizeHandle(ctx, hoveredResize, x, y)) {
      startResizeMode(hoveredResize, x, y);
      return;
    }

    if (note) {
      // Check if clicking on a resize handle
      const resizeHandleHit = isOnResizeHandle(ctx, note, x, y);
      if (resizeHandleHit) {
        console.log('Resize mode started!');
        startResizeMode(note, x, y);
        return;
      }

      // Normal dragging of a note
      registerSelectionStart(ctx.grid!);
      ctx.setSelectedNote(note);
      registerSelectionStart(ctx.grid!);
      ctx.setSelectedNote(note);
      dragState = {
        startX: x,
        startY: y,
        anchorNote: note,
        initialNotes: [
          {
            note,
            start: note.start,
            midi: pitchToMidi(note.pitch) ?? 0
          }
        ],
        lastPreviewPitch: undefined
      };      
      return;
    }

    // If clicking empty space, allow drag-to-marquee possibility
    registerPotentialDragStart(x, y);
    hasActivatedMarquee = false;
  }

  function moveHandler(e: MouseEvent): void {
    ctx.grid!.setCursor('default');
    const { x, y } = ctx.getCanvasPos(e);

    if (x < 0) {
      ctx.clearPreview();
      return;
    }

    const resizeState = getResizeState();
    if (resizeState) {
      ctx.grid!.setCursor('ew-resize');

      const deltaX = x - resizeState.startX;
      const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
      const newDuration = Math.max(getSnapResolution(), resizeState.originalDuration + beatDelta);

      resizeState.anchorNote.duration = newDuration;

      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      return;
    }

    updatePastePreview(ctx, x, y);

    clearHoveredResizeNote();
    ctx.grid!.setCursor('default');

    const selectedNotes = ctx.getSelectedNotes?.() ?? [];
    for (const note of selectedNotes) {
      if (isOnResizeHandle(ctx, note, x, y)) {
        setHoveredResizeNote(note);
        ctx.grid!.setCursor('ew-resize');
        break;
      }
    }

    if (!resizeState && !hasActivatedMarquee && hasCrossedDragThreshold(x, y)) {
      enterTemporarySelectMode();
      ctx.selectionBox = {
        active: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y
      };
      hasActivatedMarquee = true;
      registerSelectionStart(ctx.grid!);
      resetMouseGestureState();
      return;
    }

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered ?? null);

    const selected = ctx.getSelectedNote();

    if (!getResizeState()) {
      if (dragState && selected) {
        ctx.grid!.setCursor('grabbing');
      } else if (hovered) {
        ctx.grid!.setCursor('grab');
      }
    }

    if (!hovered && !dragState && !shouldSuppressNotePlacement() && !getHoveredResizeNote()) {
      const snappedBeat = ctx.getSnappedBeatFromX(x);
      const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
      const totalBeats = getTotalBeats();

      if (snappedBeat + ctx.config.currentDuration <= totalBeats) {
        ctx.updatePreview({ pitch, start: snappedBeat, duration: ctx.config.currentDuration });
      } else {
        ctx.clearPreview();
      }
    } else {
      ctx.clearPreview();
    }

    if (dragState && selected) {
      const deltaX = x - dragState.startX;
      const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
      const deltaY = y - dragState.startY;
      const pitchOffset = Math.round(deltaY / ctx.getCellHeight());

      const newStart = Math.max(0, dragState.initialNotes[0].start + beatDelta);
      const totalBeats = getTotalBeats();

      if (newStart + selected.duration <= totalBeats) {
        selected.start = newStart;
      }

      const newMidi = dragState.initialNotes[0].midi - pitchOffset;
      const minMidi = pitchToMidi(ctx.config.noteRange[0]) ?? 0;
      const maxMidi = pitchToMidi(ctx.config.noteRange[1]) ?? 127;
      const clamped = Math.max(minMidi, Math.min(maxMidi, newMidi));
      const newPitch = midiToPitch(clamped) ?? selected.pitch;

      if (newPitch !== selected.pitch) {
        selected.pitch = newPitch;

        if (lastPlayedPitch !== newPitch) {
          lastPlayedPitch = newPitch;
          ctx.sequencer.playNote(newPitch, 0.5);
        }
      }

      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      setSuppressNextNotePlacement();
      return;
    }

    ctx.scheduleRedraw();
  }

  function upHandler(e: MouseEvent): void {
    console.log('UpHandler called');
    resetMouseGestureState();
    hasActivatedMarquee = false;
  
    const resizeState = getResizeState();
    if (resizeState) {
      const { anchorNote, originalDuration } = resizeState;
      const finalDuration = anchorNote.duration;
  
      const wasResized = originalDuration !== finalDuration;
  
      if (wasResized) {
        recordDiff(
          createResizeNotesDiff(ctx.sequencer.id, [
            { pitch: anchorNote.pitch, start: anchorNote.start, newDuration: finalDuration }
          ]),
          createReverseResizeNotesDiff(ctx.sequencer.id, [
            { pitch: anchorNote.pitch, start: anchorNote.start, oldDuration: originalDuration }
          ])
        );
      }
  
      clearResizeState();
      setSuppressNextNotePlacement();
      return;
    }
  
    if (!dragState || !ctx.getSelectedNote()) {
      dragState = null;
      return;
    }
  
    const { anchorNote } = dragState;
    const anchor = dragState.initialNotes.find(n => n.note === anchorNote);
    if (!anchor) return; // Safety
    
    const finalNote = {
      pitch: anchor.note.pitch,
      start: anchor.note.start,
      duration: anchor.note.duration
    };
    
    const wasMoved =
      anchor.start !== anchor.note.start ||
      anchor.midi !== pitchToMidi(anchor.note.pitch);
    
    if (wasMoved) {
      recordDiff(
        createMoveNotesDiff(ctx.sequencer.id, [
          { pitch: midiToPitch(anchor.midi) ?? anchor.note.pitch, start: anchor.start, duration: anchor.note.duration }
        ], [
          finalNote
        ]),
        createReverseMoveNotesDiff(ctx.sequencer.id, [
          { pitch: midiToPitch(anchor.midi) ?? anchor.note.pitch, start: anchor.start, duration: anchor.note.duration }
        ], [
          finalNote
        ])
      );
    }
  
    setSuppressNextNotePlacement();
    dragState = null;
  }
  
  function leaveHandler(): void {
    ctx.clearPreview();
    ctx.setHoveredNote(null);
    clearHoveredResizeNote();
    clearPastePreviewIfNeeded(ctx);
    ctx.scheduleRedraw();
  }
  
  return {
    attach(canvas: HTMLCanvasElement) {
      canvas.addEventListener('click', clickHandler);
      canvas.addEventListener('contextmenu', contextHandler);
      canvas.addEventListener('mousemove', moveHandler);
      canvas.addEventListener('mouseleave', leaveHandler);
      canvas.addEventListener('mousedown', downHandler);
      canvas.addEventListener('mouseup', upHandler);
    },
    detach(canvas: HTMLCanvasElement) {
      canvas.removeEventListener('click', clickHandler);
      canvas.removeEventListener('contextmenu', contextHandler);
      canvas.removeEventListener('mousemove', moveHandler);
      canvas.removeEventListener('mouseleave', leaveHandler);
      canvas.removeEventListener('mousedown', downHandler);
      canvas.removeEventListener('mouseup', upHandler);
    }
  } satisfies MouseHandler;
}  