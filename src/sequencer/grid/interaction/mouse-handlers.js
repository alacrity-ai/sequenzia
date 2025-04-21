import { pitchToMidi, midiToPitch, getTotalBeats } from '../../../helpers.js';

export function bindMouseEvents(canvas, {
  sequencer,
  config,
  notes,
  getCellWidth,
  getCellHeight,
  getCanvasPos,
  findNoteAt,
  scheduleRedraw,
  getPitchFromRow,
  getSnappedBeatFromX,
  getRawBeatFromX,
  updatePreview,
  clearPreview,
  getSelectedNote,
  setSelectedNote,
  getHoveredNote,
  setHoveredNote,
  onNotesChanged
}) {
  let dragState = null;
  let lastPlayedPitch = null;

  canvas.addEventListener('click', e => {
    const { x, y } = getCanvasPos(e);

    // If clicking on the piano roll, audition the note but don't place it
    if (x < 0) {
      const pitch = getPitchFromRow(Math.floor(y / getCellHeight()));
      sequencer.playNote(pitch, 0.5);
      return;
    }

    const found = findNoteAt(x, y);
    if (found) {
      setSelectedNote(found);
      scheduleRedraw();
      if (onNotesChanged) onNotesChanged();
      return;
    }

    const snappedBeat = getSnappedBeatFromX(x, config);
    const pitch = getPitchFromRow(Math.floor(y / getCellHeight()));
    const totalBeats = getTotalBeats(config);

    if (snappedBeat + config.currentDuration > totalBeats) return;

    const duration = 0.5;
    sequencer.playNote(pitch, duration);
    
    notes.push({
      pitch,
      start: snappedBeat,
      duration: config.currentDuration
    });

    scheduleRedraw();
    if (onNotesChanged) onNotesChanged();
  });

  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    const found = findNoteAt(x, y);
    if (found) {
      const idx = notes.indexOf(found);
      if (idx !== -1) notes.splice(idx, 1);
      scheduleRedraw();
      if (onNotesChanged) onNotesChanged();
    }
  });

  canvas.addEventListener('mousemove', e => {
    const { x, y } = getCanvasPos(e);

    // Bailout if we're over the piano roll
    if (x < 0) {
      clearPreview();
      return;
    };

    const hovered = findNoteAt(x, y);
    setHoveredNote(hovered);

    const selected = getSelectedNote();

    if (!dragState && selected && selected !== hovered) {
      setSelectedNote(null);
    }
    
    // Preview
    if (!hovered && !dragState) {
      const snappedBeat = getSnappedBeatFromX(x, config);
      const pitch = getPitchFromRow(Math.floor(y / getCellHeight()));
      const totalBeats = getTotalBeats(config);

      if (snappedBeat + config.currentDuration <= totalBeats) {
        updatePreview({ pitch, start: snappedBeat, duration: config.currentDuration });
      } else {
        clearPreview();
      }
    } else {
      clearPreview();
    }

    // Drag logic
    if (dragState && selected) {
      const deltaX = x - dragState.startX;
      const beatDelta = getSnappedBeatFromX(deltaX, config) - getSnappedBeatFromX(0, config);
      const newStart = Math.max(0, dragState.initialStart + beatDelta);

      const totalBeats = getTotalBeats(config);
      if (newStart + selected.duration <= totalBeats) {
        selected.start = newStart;
      }

      const deltaY = y - dragState.startY;
      const pitchOffset = Math.round(deltaY / getCellHeight());
      const newMidi = dragState.initialMidi - pitchOffset;

      const minMidi = pitchToMidi(config.noteRange[0]);
      const maxMidi = pitchToMidi(config.noteRange[1]);
      const clamped = Math.max(minMidi, Math.min(maxMidi, newMidi));
      const newPitch = midiToPitch(clamped);

      if (newPitch !== selected.pitch) {
        selected.pitch = newPitch;

        if (lastPlayedPitch !== newPitch) {
          lastPlayedPitch = newPitch;

          const duration = 0.5; 
          sequencer.playNote(newPitch, duration);
        }
      }

      scheduleRedraw();
      if (onNotesChanged) onNotesChanged();
      return;
    }

    scheduleRedraw();
  });

  canvas.addEventListener('mouseleave', () => {
    clearPreview();
    setHoveredNote(null);
    scheduleRedraw();
  });

  canvas.addEventListener('mousedown', e => {
    const { x, y } = getCanvasPos(e);
    const note = findNoteAt(x, y);
    if (!note) return;

    setSelectedNote(note);
    dragState = {
      startX: x,
      startY: y,
      initialStart: note.start,
      initialMidi: pitchToMidi(note.pitch)
    };
  });

  canvas.addEventListener('mouseup', () => {
    dragState = null;
  });
}
