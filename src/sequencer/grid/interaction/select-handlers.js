import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getTotalBeats } from '../../transport.js'
import { registerSelectionStart } from '../../../setup/selectionTracker.js';
import { handlePasteEvent, isPasteModeActive } from '../../../setup/pasteModeStore.js';
import { getClipboard } from '../../clipboard.js';
import { updatePasteHoverGrid } from '../../../setup/pasteModeStore.js';

export function getSelectModeHandlers(ctx) {
  let dragState = null;

  function contextHandler(e) {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const clicked = ctx.findNoteAt(x, y);
    if (!clicked) return;
  
    const selected = ctx.getSelectedNotes();
  
    if (selected.includes(clicked)) {
      // Delete all selected notes
      for (const note of selected) {
        const idx = ctx.notes.indexOf(note);
        if (idx !== -1) ctx.notes.splice(idx, 1);
      }
      ctx.setSelectedNotes([]);
    } else {
      // Delete only the clicked note
      const idx = ctx.notes.indexOf(clicked);
      if (idx !== -1) ctx.notes.splice(idx, 1);
    }
  
    ctx.scheduleRedraw();
    ctx.onNotesChanged?.();
  }  

  function downHandler(e) {
    // llow paste to hijack this click and short-circuit normal selection
    if (isPasteModeActive()) {
        handlePasteEvent(ctx.grid, e);
        e.preventDefault();
        e.stopPropagation();
        return;
    }

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

  function moveHandler(e) {
    updatePasteHoverGrid(ctx.grid);
    const { x, y } = ctx.getCanvasPos(e);

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered);

    if (isPasteModeActive()) {
        const { notes, anchorBeat, anchorMidi } = getClipboard();
        const snappedBeat = ctx.getSnappedBeatFromX(x);
        const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
        const midi = pitchToMidi(pitch);
      
        const deltaBeat = snappedBeat - anchorBeat;
        const deltaMidi = midi - anchorMidi;
      
        const previewNotes = notes.map(n => ({
          pitch: midiToPitch(pitchToMidi(n.pitch) + deltaMidi),
          start: n.start + deltaBeat,
          duration: n.duration
        }));
      
        ctx.setPastePreviewNotes(previewNotes);
        ctx.scheduleRedraw();
        return;
      } else {
        ctx.setPastePreviewNotes(null);
      }
      

    if (ctx.selectionBox?.active) {
      ctx.selectionBox.currentX = x;
      ctx.selectionBox.currentY = y;

      const box = ctx.selectionBox;
      const x1 = Math.min(box.startX, box.currentX);
      const y1 = Math.min(box.startY, box.currentY);
      const x2 = Math.max(box.startX, box.currentX);
      const y2 = Math.max(box.startY, box.currentY);

      const topRow = Math.floor(y1 / ctx.getCellHeight());
      const bottomRow = Math.floor(y2 / ctx.getCellHeight());
      const startBeat = ctx.getSnappedBeatFromX(x1);
      const endBeat = ctx.getSnappedBeatFromX(x2);

      const pitchTop = pitchToMidi(ctx.getPitchFromRow(topRow));
      const pitchBottom = pitchToMidi(ctx.getPitchFromRow(bottomRow));

      const highlightCandidates = ctx.notes.filter(note => {
        const midi = pitchToMidi(note.pitch);
        const noteStart = note.start;
        const noteEnd = note.start + note.duration;
        const beatOverlap = noteStart >= startBeat && noteEnd <= endBeat;
        const pitchOverlap = midi >= pitchBottom && midi <= pitchTop;
        return beatOverlap && pitchOverlap;
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

  function upHandler(e) {
    dragState = null;

    if (ctx.selectionBox?.active) {
      const { x, y } = ctx.getCanvasPos(e);
      ctx.selectionBox.currentX = x;
      ctx.selectionBox.currentY = y;
      ctx.selectionBox.active = false;

      const box = ctx.selectionBox;
      const x1 = Math.min(box.startX, box.currentX);
      const y1 = Math.min(box.startY, box.currentY);
      const x2 = Math.max(box.startX, box.currentX);
      const y2 = Math.max(box.startY, box.currentY);

      const topRow = Math.floor(y1 / ctx.getCellHeight());
      const bottomRow = Math.floor(y2 / ctx.getCellHeight());
      const startBeat = ctx.getSnappedBeatFromX(x1);
      const endBeat = ctx.getSnappedBeatFromX(x2);

      const pitchTop = pitchToMidi(ctx.getPitchFromRow(topRow));
      const pitchBottom = pitchToMidi(ctx.getPitchFromRow(bottomRow));

      const selected = ctx.notes.filter(note => {
        const midi = pitchToMidi(note.pitch);
        const noteStart = note.start;
        const noteEnd = note.start + note.duration;
      
        const fullyWithinBeats = noteStart >= startBeat && noteEnd <= endBeat;
        const fullyWithinPitches = midi >= pitchBottom && midi <= pitchTop;
      
        return fullyWithinBeats && fullyWithinPitches;
      });      
      ctx.setHighlightedNotes([]);
      ctx.setSelectedNotes(selected);
      ctx.scheduleRedraw();
    }
  }

  function leaveHandler() {
    ctx.setHoveredNote(null);
    ctx.setHighlightedNotes([]);
    if (isPasteModeActive()) {
      ctx.setPastePreviewNotes(null); // ✅ updated from setPastePreviewNote
    }
  
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
