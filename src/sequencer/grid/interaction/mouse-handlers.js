import { pitchToMidi, midiToPitch, getTotalBeats } from '../../../helpers.js';

export function getNotePlacementHandlers(ctx) {
  let dragState = null;
  let lastPlayedPitch = null;

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
    const totalBeats = getTotalBeats(ctx.config);

    if (snappedBeat + ctx.config.currentDuration > totalBeats) return;

    ctx.sequencer.playNote(pitch, 0.5);

    ctx.notes.push({
      pitch,
      start: snappedBeat,
      duration: ctx.config.currentDuration
    });

    ctx.scheduleRedraw();
    ctx.onNotesChanged?.();
  }

  function contextHandler(e) {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const found = ctx.findNoteAt(x, y);
    if (found) {
      const idx = ctx.notes.indexOf(found);
      if (idx !== -1) ctx.notes.splice(idx, 1);
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
    }
  }

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
      const totalBeats = getTotalBeats(ctx.config);

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
      const totalBeats = getTotalBeats(ctx.config);

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

  function leaveHandler() {
    ctx.clearPreview();
    ctx.setHoveredNote(null);
    ctx.scheduleRedraw();
  }

  function downHandler(e) {
    const { x, y } = ctx.getCanvasPos(e);
    const note = ctx.findNoteAt(x, y);
    if (!note) return;

    ctx.setSelectedNote(note);
    dragState = {
      startX: x,
      startY: y,
      initialStart: note.start,
      initialMidi: pitchToMidi(note.pitch)
    };
  }

  function upHandler() {
    dragState = null;
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
