// src/sequencer/grid/interaction/mouse-handlers.js

import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getTotalBeats } from '../../transport.js'
import { recordDiff } from '../../../appState/appState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../appState/diffEngine/types/grid/placeNotes.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';

export function getNotePlacementHandlers(ctx) {
  let dragState = null;
  let lastPlayedPitch = null;

  // Left click to place a note
  function clickHandler(e) {
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
    const { x, y } = ctx.getCanvasPos(e);
    const note = ctx.findNoteAt(x, y);
    if (!note) return;
  
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
  }

  // Handles dragging of the note while mouse is held down
  function moveHandler(e) {
    const { x, y } = ctx.getCanvasPos(e);
    if (x < 0) {
      ctx.clearPreview();
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
  function upHandler() {
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
