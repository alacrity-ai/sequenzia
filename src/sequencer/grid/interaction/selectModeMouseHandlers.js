// src/sequencer/grid/interaction/selectModeMouseHandlers.js

import { pitchToMidi, midiToPitch } from '../../../audio/pitch-utils.js';
import { EditModes, setEditMode, setSuppressNextNotePlacement, shouldAutoExitSelectMode, clearTemporarySelectModeFlag } from '../../../setup/editModeStore.js';
import { getTotalBeats } from '../../transport.js'
import { registerSelectionStart } from '../../../setup/selectionTracker.js';
import { getNotesInMarquee } from '../helpers/marquee.js';
import { updatePasteHoverGrid } from '../../../setup/pasteModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';
import { interceptPasteClickIfActive, updatePastePreview, clearPastePreviewIfNeeded } from './sharedMouseListeners.js';

export function getSelectModeHandlers(ctx) {
  let dragState = null;

  // Right click to delete a note
  function contextHandler(e) {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const clicked = ctx.findNoteAt(x, y);
    if (!clicked) return;
  
    const selected = ctx.getSelectedNotes();
    const notesToDelete = selected.includes(clicked) ? selected : [clicked];
  
    if (!notesToDelete.length) return;
  
    // 👇 Do NOT mutate ctx.notes directly — let the state engine drive it
    ctx.setSelectedNotes([]); // Just update selection state (visual)
  
    // Trigger diff (which will call resyncFromState automatically)
    recordDiff(
      createDeleteNotesDiff(ctx.sequencer.id, notesToDelete),
      createReverseDeleteNotesDiff(ctx.sequencer.id, notesToDelete)
    );

    if (shouldAutoExitSelectMode()) {
      clearTemporarySelectModeFlag();
      setEditMode(EditModes.NOTE_PLACEMENT);
    }    
  }

  // Hold down to drag a marquee box over a set of notes (if we don't have paste mode enabled), or to drag around pasted notes, if we have just pasted
  function downHandler(e) {
    // Allow paste to hijack this click and short-circuit normal selection
    if (interceptPasteClickIfActive(ctx, e)) return;

    const { x, y } = ctx.getCanvasPos(e);
    if (x < 0) return;

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered);

    // Register this sequencer as the active one
    registerSelectionStart(ctx.grid);

    const selectedNotes = ctx.getSelectedNotes();

    // Begin drag if clicking on a selected note
    if (hovered && selectedNotes.includes(hovered)) {
      dragState = {
        startX: x,
        startY: y,
        anchorNote: hovered,
        initialNotes: selectedNotes.map(n => ({
          note: n,
          start: n.start,
          midi: pitchToMidi(n.pitch)
        }))
      };
      return;
    }

    // Otherwise: initiate marquee box selection
    ctx.selectionBox = {
      active: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    };

    ctx.clearPreview();
    ctx.setSelectedNote(null);
  }

  // Handles dragging of note(s) while mouse is held down
  function moveHandler(e) {
    updatePasteHoverGrid(ctx.grid);
    const { x, y } = ctx.getCanvasPos(e);

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered);

    updatePastePreview(ctx, x, y);

    if (ctx.selectionBox?.active) {
      ctx.selectionBox.currentX = x;
      ctx.selectionBox.currentY = y;

      const box = ctx.selectionBox;

      // const overlap extra pixels
      const highlightCandidates = getNotesInMarquee(ctx.notes, {
        startX: box.startX,
        currentX: box.currentX,
        startY: box.startY,
        currentY: box.currentY,
        getCellHeight: ctx.getCellHeight,
        getSnappedBeatFromX: ctx.getSnappedBeatFromX,
        getPitchFromRow: ctx.getPitchFromRow
      });
      ctx.setHighlightedNotes(highlightCandidates);
      ctx.scheduleRedraw();
      
      return;
    }

    if (dragState) {
      const deltaX = x - dragState.startX;
      const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
      const deltaY = y - dragState.startY;
      const pitchOffset = Math.round(deltaY / ctx.getCellHeight());

      const totalBeats = getTotalBeats();
      const minMidi = pitchToMidi(ctx.config.noteRange[0]);
      const maxMidi = pitchToMidi(ctx.config.noteRange[1]);
      
      for (const { note, start, midi } of dragState.initialNotes) {
        const newStart = Math.max(0, start + beatDelta);
        const newMidi = Math.max(minMidi, Math.min(maxMidi, midi - pitchOffset));
        const newPitch = midiToPitch(newMidi);
      
        if (newStart + note.duration <= totalBeats) {
          note.start = newStart;
          note.pitch = newPitch;
        }
      }
      
      // Only play the anchor note's new pitch
      const anchor = dragState.initialNotes.find(n => n.note === dragState.anchorNote);
      if (anchor) {
        const previewPitch = anchor.note.pitch;
        if (dragState.lastPreviewPitch !== previewPitch) {
          dragState.lastPreviewPitch = previewPitch;
          ctx.sequencer.playNote(previewPitch, 0.5);
        }
      }        

      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
    }
  }

  // Handles releasing dragged note(s)
  function upHandler(e) {
    if (dragState?.initialNotes?.length) {
      const { initialNotes } = dragState;
  
      const from = initialNotes.map(({ start, midi, note }) => ({
        pitch: midiToPitch(midi),
        start,
        duration: note.duration
      }));
  
      const to = initialNotes.map(({ note }) => ({
        pitch: note.pitch,
        start: note.start,
        duration: note.duration
      }));
  
      const wasMoved = from.some((f, i) =>
        f.pitch !== to[i].pitch || f.start !== to[i].start
      );
  
      if (wasMoved) {
        recordDiff(
          createMoveNotesDiff(ctx.sequencer.id, from, to),
          createReverseMoveNotesDiff(ctx.sequencer.id, from, to)
        );

        if (shouldAutoExitSelectMode()) {
          clearTemporarySelectModeFlag();
          setEditMode(EditModes.NOTE_PLACEMENT);
        }        
      }

    }
  
    dragState = null;
  
    // Marquee selection logic
    if (ctx.selectionBox?.active) {
      const { x, y } = ctx.getCanvasPos(e);
      ctx.selectionBox.currentX = x;
      ctx.selectionBox.currentY = y;
      ctx.selectionBox.active = false;
      
      const selected = getNotesInMarquee(ctx.notes, {
        startX: ctx.selectionBox.startX,
        currentX: ctx.selectionBox.currentX,
        startY: ctx.selectionBox.startY,
        currentY: ctx.selectionBox.currentY,
        getCellHeight: ctx.getCellHeight,
        getSnappedBeatFromX: ctx.getSnappedBeatFromX,
        getPitchFromRow: ctx.getPitchFromRow
      });
  
      ctx.setHighlightedNotes([]);
      ctx.setSelectedNotes(selected);
      ctx.scheduleRedraw();

      if (shouldAutoExitSelectMode()) {
        console.log('AUTO EXITED MODE')
        const selected = ctx.getSelectedNotes();
        if (selected.length === 0) {
          e.stopPropagation();
          clearTemporarySelectModeFlag();
          setEditMode(EditModes.NOTE_PLACEMENT);
          setSuppressNextNotePlacement();
        }
      }
      setSuppressNextNotePlacement();    
    }
  }

  // Handles mouse leaving the grid canvas area
  function leaveHandler() {
    ctx.setHoveredNote(null);
    ctx.setHighlightedNotes([]);
    clearPastePreviewIfNeeded(ctx);
    ctx.scheduleRedraw();
  }  

  return {
    attach(canvas) {
      canvas.addEventListener('mousedown', downHandler);
      canvas.addEventListener('mousemove', moveHandler);
      canvas.addEventListener('mouseup', upHandler);
      canvas.addEventListener('mouseleave', leaveHandler);
      canvas.addEventListener('contextmenu', contextHandler);
    },
    detach(canvas) {
      canvas.removeEventListener('mousedown', downHandler);
      canvas.removeEventListener('mousemove', moveHandler);
      canvas.removeEventListener('mouseup', upHandler);
      canvas.removeEventListener('mouseleave', leaveHandler);
      canvas.removeEventListener('contextmenu', contextHandler);
    }
  };
}
