// src/sequencer/grid/interaction/noteModeMouseHandlers.js

import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getTotalBeats } from '../../transport.js'
import { enterTemporarySelectMode, shouldSuppressNotePlacement, clearSuppressNotePlacementFlag } from '../../../setup/editModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';
import {
  registerPotentialDragStart,
  hasCrossedDragThreshold,
  resetMouseGestureState,
  interceptPasteClickIfActive,
  updatePastePreview,
  clearPastePreviewIfNeeded
} from './sharedMouseListeners.js';
import { registerSelectionStart } from '../../../setup/selectionTracker.js';

export function getNotePlacementHandlers(ctx) {
  let dragState = null;
  let lastPlayedPitch = null;
  let hasActivatedMarquee = false;
  

  // Left click to place a note
  function clickHandler(e) {
    registerSelectionStart(ctx.grid);
  
    if (shouldSuppressNotePlacement()) {
      clearSuppressNotePlacementFlag();
      return;
    }
  
    const { x, y } = ctx.getCanvasPos(e);
  
    if (x < 0) {
      const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
      ctx.sequencer.playNote(pitch, 0.5);
      return;
    }
  
    const found = ctx.findNoteAt(x, y);
    if (found) {
      ctx.setSelectedNote(found);
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
      return;
    }
  
    const snappedBeat = ctx.getSnappedBeatFromX(x);
    const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const totalBeats = getTotalBeats();
  
    if (snappedBeat + ctx.config.currentDuration > totalBeats) return;
  
    // ❌ Prevent duplicate placement
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
    if (note) {
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
    const { x, y } = ctx.getCanvasPos(e);
    if (x < 0) {
      ctx.clearPreview();
      return;
    }

    updatePastePreview(ctx, x, y);

    if (!hasActivatedMarquee && hasCrossedDragThreshold(x, y)) {
      enterTemporarySelectMode();
      ctx.selectionBox = {
        active: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y
      };
      hasActivatedMarquee = true;
      resetMouseGestureState(); // clear for cleanliness
      return;
    }    

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered);

    const selected = ctx.getSelectedNote();
    if (!dragState && selected && selected !== hovered) {
      ctx.setSelectedNote(null);
    }

    if (!hovered && !dragState) {
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
      return;
    }

    ctx.scheduleRedraw();
  }

  // Handles releasing a dragged note
  function upHandler(e) {
    resetMouseGestureState(); // replaces pendingClick = null;
    hasActivatedMarquee = false;

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
  
    dragState = null;
  }

  function leaveHandler() {
    ctx.clearPreview();
    ctx.setHoveredNote(null);
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
    }
  };
}
