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
  startResizeMode,
  getSelectedNote,
  setSelectedNote,
  getSelectedNotes,
  setSelectedNotes,
  setSuppressNextClick,
  clearSuppressNextClick,
  shouldSuppressNextClick
} from './sharedMouseListeners.js';


export function getNotePlacementHandlers(ctx) {
  let dragState = null;
  let lastPlayedPitch = null;
  let hasActivatedMarquee = false;

  // Left click to place a note
  function clickHandler(e) {
    if (shouldSuppressNextClick()) {
      clearSuppressNextClick();
      return;
    }
    registerSelectionStart(ctx.grid);
  
    if (getResizeState()) return;
  
    const { x, y } = ctx.getCanvasPos(e);
  
    // ✅ Try to find a note at the click position
    const found = ctx.findNoteAt(x, y);
    if (found) {
      console.log('Found note in clickHandler; skipping deselection.');
      // Do not call setSelectedNote here.
      // downHandler already selected it.
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      setSuppressNextNotePlacement();
      return;
    }

    // Clicking on piano roll (label) just plays the note
    if (x < 0) {
      const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
      ctx.sequencer.playNote(pitch, 0.5);
      return;
    }
  
    // 🚨 ONLY reach here if we clicked empty space
    if (shouldSuppressNotePlacement()) {
      clearSuppressNotePlacementFlag();
      console.log('Calling setSelectedNote(null) because clicked empty space.');
      setSelectedNote(null);
      ctx.scheduleRedraw();
      return;
    }
  
    const snappedBeat = ctx.getSnappedBeatFromX(x);
    const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const totalBeats = getTotalBeats();
  
    if (snappedBeat + ctx.config.currentDuration > totalBeats) return;
  
    const alreadyExists = ctx.notes.some(n => n.pitch === pitch && n.start === snappedBeat);
    if (alreadyExists) return;
  
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
  }

  // Hold down on a note (with the intent to drag it)
  function downHandler(e) {
    if (interceptPasteClickIfActive(ctx, e)) return;
    const { x, y } = ctx.getCanvasPos(e);
  
    const note = ctx.findNoteAt(x, y);
  
    const hoveredResize = getHoveredResizeNote();
    if (hoveredResize && isOnResizeHandle(ctx, hoveredResize, x, y)) {
      dragState = null;
      startResizeMode(hoveredResize, x, y);
      return;
    }

    if (note) {
      // Check if we're clicking on a resize handle
      const resizeHandleHit = isOnResizeHandle(ctx, note, x, y);
      if (resizeHandleHit) {
        // Begin resize mode
        dragState = null;
        startResizeMode(note, x, y);
        return;
      }
  
      // Normal note dragging
      registerSelectionStart(ctx.grid);
      console.log('Calling setSelectedNote from downHandler line 173')
      setSelectedNote(note);
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
      ctx.scheduleRedraw();
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
    if (x < 0) {
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

    const selectedNotes = getSelectedNotes?.() ?? [];
    for (const note of selectedNotes) {
      if (isOnResizeHandle(ctx, note, x, y)) {
        setHoveredResizeNote(note);
        ctx.grid.setCursor('ew-resize'); // Change cursor to horizontal resize
        break;
      }
    }

    // Check if we've crossed the drag threshold
    if (!resizeState && !hasActivatedMarquee && hasCrossedDragThreshold(x, y) && !dragState) {
      console.log('Entered temporary select mode.');
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
    const selected = getSelectedNote();
    ctx.setHoveredNote(hovered);
    
    // Cursor logic for note hovering/dragging
    if (!getResizeState()) { // Don't override resize cursor
      if (dragState && selected) {
        ctx.grid.setCursor('grabbing');
      } else if (hovered) {
        ctx.grid.setCursor('grab');
      }
    }    

    // Show preview note if not hovering over a note
    if (!hovered && !dragState && !shouldSuppressNotePlacement()) {
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

      // Prevent dragging off the grid
      if (newStart + selected.duration <= totalBeats) {
        selected.start = newStart;
      }

      // Handle pitch dragging
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

      // Find the new note at the new location
      setSuppressNextClick();
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      return;
    }

    ctx.scheduleRedraw();
  }

  // Handles releasing a dragged note, releasing a marquee box, or releasing a resize handle
  function upHandler(e) {
    resetMouseGestureState(); // replaces pendingClick = null;
    hasActivatedMarquee = false;

    // Handle resize
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

      console.log('Calling setSelectedNote from upHandler line 348')
      const refreshedNote = ctx.findNoteAt(
        anchorNote.start * ctx.getCellWidth() + 1, // a little offset to land inside the note
        ctx.getPitchRow(anchorNote.pitch) * ctx.getCellHeight() + 1
      );
      
      if (refreshedNote) {
        setSelectedNote(refreshedNote);
      } else {
        console.warn('Failed to refresh moved note reference');
      }
      

      setSuppressNextClick();

      ctx.scheduleRedraw();
      return;
    }    

    // If we didn't drag a note, just return
    if (!dragState || !getSelectedNote()) {
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
      setSuppressNextClick();
      setSuppressNextNotePlacement();
      console.log('Calling setSelectedNote from upHandler line 379')
      setSelectedNote(anchorNote);
      console.log('Selected anchorNote:', anchorNote);
      console.log('Current selectedNote (getSelectedNote()):', getSelectedNote());

    }
  
    ctx.scheduleRedraw();
    
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
