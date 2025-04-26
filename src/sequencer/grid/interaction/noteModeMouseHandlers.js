// src/sequencer/grid/interaction/noteModeMouseHandlers.js

import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getSnapResolution, getTotalBeats } from '../../transport.js'
import { enterTemporarySelectMode, setSuppressNextNotePlacement, shouldSuppressNotePlacement, clearSuppressNotePlacementFlag } from '../../../setup/editModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';
import { createResizeNotesDiff, createReverseResizeNotesDiff } from '../../../appState/diffEngine/types/grid/resizeNotes.js';
import {
  registerPotentialDragStart,
  hasCrossedDragThreshold,
  resetMouseGestureState,
  interceptPasteClickIfActive,
  updatePastePreview,
  clearPastePreviewIfNeeded
} from './sharedMouseListeners.js';
import { registerSelectionStart } from '../../../setup/selectionTracker.js';
import { animateNotePlacement } from '../animation/notePlacementAnimation.js';
import { animateNoteDeletion } from '../animation/noteDeleteAnimation.js';
import { labelWidth } from '../helpers/constants.js';
import { isOnResizeHandle } from '../helpers/resize-note.js';
import { 
  setHoveredResizeNote, 
  clearHoveredResizeNote, 
  getHoveredResizeNote,
  getResizeState,
  clearResizeState,
  startResizeMode
} from './sharedMouseListeners.js';


export function getNotePlacementHandlers(ctx) {
  let dragState = null;
  let lastPlayedPitch = null;
  let hasActivatedMarquee = false;

  // Left click to place a note
  function clickHandler(e) {
    console.log('ClickHandler called')
    registerSelectionStart(ctx.grid);

    // If we're suppressing note placement, clear the flag and deselect the note
    if (shouldSuppressNotePlacement()) {
      clearSuppressNotePlacementFlag();
      ctx.scheduleRedraw();
      return;
    }
  
    const { x, y } = ctx.getCanvasPos(e);

    // If we're clicking on the label, just play the note
    if (x < 0) {
      const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
      ctx.sequencer.playNote(pitch, 0.5);
      return;
    }
  
    const snappedBeat = ctx.getSnappedBeatFromX(x);
    const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const totalBeats = getTotalBeats();
  
    if (snappedBeat + ctx.config.currentDuration > totalBeats) return;
  
    // Prevent duplicate placement
    const alreadyExists = ctx.notes.some(n => n.pitch === pitch && n.start === snappedBeat);
    if (alreadyExists) return;
  
    // Play the note and place it
    ctx.sequencer.playNote(pitch, 0.5);
    const newNote = {
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
      labelWidth: labelWidth
    });
  
    ctx.scheduleRedraw();
    ctx.onNotesChanged?.();
  }

  // Right click to delete a note
  function contextHandler(e) {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const found = ctx.findNoteAt(x, y);
    if (!found) return;
  
    const idx = ctx.notes.indexOf(found);
    if (idx === -1) return;
  
    // Animate before deletion
    animateNoteDeletion(ctx, found, {
      getPitchRow: ctx.getPitchRow,
      cellWidth: ctx.getCellWidth(),
      cellHeight: ctx.getCellHeight(),
      labelWidth
    });

    const toDelete = [found];
  
    // Record the diff
    recordDiff(
      createDeleteNotesDiff(ctx.sequencer.id, toDelete),
      createReverseDeleteNotesDiff(ctx.sequencer.id, toDelete)
    );
    clearSuppressNotePlacementFlag();
    ctx.setSelectedNote(null);
    ctx.scheduleRedraw();
  }

  // Hold down on a note (with the intent to drag it)
  function downHandler(e) {
    if (interceptPasteClickIfActive(ctx, e)) return;
    const { x, y } = ctx.getCanvasPos(e);
  
    const note = ctx.findNoteAt(x, y);
  
    const hoveredResize = getHoveredResizeNote();
    if (hoveredResize && isOnResizeHandle(ctx, hoveredResize, x, y)) {
      startResizeMode(hoveredResize, x, y);
      return;
    }

    if (note) {
      // Check if we're clicking on a resize handle
      const resizeHandleHit = isOnResizeHandle(ctx, note, x, y);
      if (resizeHandleHit) {
        // Begin resize mode
        console.log('Resize mode started!');
        startResizeMode(note, x, y);
        return;
      }
  
      // Normal note dragging
      registerSelectionStart(ctx.grid);
      ctx.setSelectedNote(note);
      dragState = {
        startX: x,
        startY: y,
        anchorNote: note,
        initialStart: note.start,
        initialMidi: pitchToMidi(note.pitch),
        initialNote: {
          pitch: note.pitch,
          start: note.start,
          duration: note.duration
        }
      };
      return;
    }
  
    // If empty space — initiate pending click
    registerPotentialDragStart(x, y);
    hasActivatedMarquee = false;
  }

  // Handles dragging of the note while mouse is held down
  function moveHandler(e) {
    ctx.grid.setCursor('default');
    const { x, y } = ctx.getCanvasPos(e);
    if (x < 0 ) {
      ctx.clearPreview();
      return;
    }

    const resizeState = getResizeState();
    if (resizeState) {
      ctx.grid.setCursor('ew-resize');
      const { anchorNote, startX } = resizeState;
      const { x } = ctx.getCanvasPos(e);
    
      const deltaX = x - startX;
      const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
    
      const newDuration = Math.max(getSnapResolution(), resizeState.originalDuration + beatDelta);
      anchorNote.duration = newDuration;
    
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      return; // Only handle resize this frame
    }    

    updatePastePreview(ctx, x, y);

    // Check if hovering over a resize handle
    clearHoveredResizeNote();
    ctx.grid.setCursor('default'); // Reset to default at start of move

    const selectedNotes = ctx.getSelectedNotes?.() ?? [];
    for (const note of selectedNotes) {
      if (isOnResizeHandle(ctx, note, x, y)) {
        setHoveredResizeNote(note);
        ctx.grid.setCursor('ew-resize'); // Change cursor to horizontal resize
        break;
      }
    }

    // Check if we've crossed the drag threshold
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
      registerSelectionStart(ctx.grid);
      resetMouseGestureState(); // clear for cleanliness
      return;
    }    

    // Check if we're hovering over a note
    const hovered = ctx.findNoteAt(x, y);
    const selected = ctx.getSelectedNote();
    ctx.setHoveredNote(hovered);
    
    // Cursor logic for note hovering/dragging
    if (!getResizeState()) { // Don't override resize cursor
      if (dragState && selected) {
        ctx.grid.setCursor('grabbing');
      } else if (hovered) {
        ctx.grid.setCursor('grab');
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

    // Handle dragging
    if (dragState && selected) {
      const deltaX = x - dragState.startX;
      const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
      const newStart = Math.max(0, dragState.initialStart + beatDelta);
      const totalBeats = getTotalBeats();

      if (newStart + selected.duration <= totalBeats) {
        selected.start = newStart;
      }

      const deltaY = y - dragState.startY;
      const pitchOffset = Math.round(deltaY / ctx.getCellHeight());
      const newMidi = dragState.initialMidi - pitchOffset;

      const minMidi = pitchToMidi(ctx.config.noteRange[0]);
      const maxMidi = pitchToMidi(ctx.config.noteRange[1]);
      const clamped = Math.max(minMidi, Math.min(maxMidi, newMidi));
      const newPitch = midiToPitch(clamped);

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

  // Handles releasing a dragged note
  function upHandler(e) {
    console.log('UpHandler called')
    resetMouseGestureState(); // replaces pendingClick = null;
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
  
    const { anchorNote, initialNote } = dragState;
    const finalNote = {
      pitch: anchorNote.pitch,
      start: anchorNote.start,
      duration: anchorNote.duration
    };
  
    const wasMoved =
      initialNote.pitch !== finalNote.pitch ||
      initialNote.start !== finalNote.start;
  
    if (wasMoved) {
      recordDiff(
        createMoveNotesDiff(ctx.sequencer.id, [initialNote], [finalNote]),
        createReverseMoveNotesDiff(ctx.sequencer.id, [initialNote], [finalNote])
      );

    }
    setSuppressNextNotePlacement();
    dragState = null;
  }

  function leaveHandler() {
    ctx.clearPreview();
    ctx.setHoveredNote(null);
    clearHoveredResizeNote();
    clearPastePreviewIfNeeded(ctx);
    ctx.scheduleRedraw();
  }

  return {
    attach(canvas) {
      canvas.addEventListener('click', clickHandler);
      canvas.addEventListener('contextmenu', contextHandler);
      canvas.addEventListener('mousemove', moveHandler);
      canvas.addEventListener('mouseleave', leaveHandler);
      canvas.addEventListener('mousedown', downHandler);
      canvas.addEventListener('mouseup', upHandler);
    },
    detach(canvas) {
      canvas.removeEventListener('click', clickHandler);
      canvas.removeEventListener('contextmenu', contextHandler);
      canvas.removeEventListener('mousemove', moveHandler);
      canvas.removeEventListener('mouseleave', leaveHandler);
      canvas.removeEventListener('mousedown', downHandler);
      canvas.removeEventListener('mouseup', upHandler);
    },
  };
}
