// src/sequencer/grid/interaction/sharedMouseListeners.js

import { isPasteModeActive, handlePasteEvent } from '../../../setup/pasteModeStore.js';

import { getClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../helpers.js';

// Handle resize
let hoveredResizeNote = null;
let resizeState = null;

export function setHoveredResizeNote(note) {
  hoveredResizeNote = note;
}

export function getHoveredResizeNote() {
  return hoveredResizeNote;
}

export function clearHoveredResizeNote() {
  hoveredResizeNote = null;
}

export function startResizeMode(anchorNote, startX, startY) {
  resizeState = {
    anchorNote,
    startX,
    startY,
    originalDuration: anchorNote.duration,
  };
}

export function getResizeState() {
  return resizeState;
}

export function clearResizeState() {
  resizeState = null;
}


/**
 * Update paste preview notes based on cursor position
 * Used in move handlers while paste mode is active
 */
export function updatePastePreview(ctx, x, y) {
  if (!isPasteModeActive()) {
    ctx.setPastePreviewNotes(null);
    return;
  }

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
}

export function clearPastePreviewIfNeeded(ctx) {
    if (isPasteModeActive()) {
        ctx.setPastePreviewNotes(null);
    }
}  

// Handle paste
export function interceptPasteClickIfActive(ctx, e) {
  if (isPasteModeActive()) {
    handlePasteEvent(ctx.grid, e);
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
}

// Handle dragging
let dragStart = null;
const DRAG_THRESHOLD = 8;

export function resetMouseGestureState() {
  dragStart = null;
}

export function registerPotentialDragStart(x, y) {
  dragStart = { x, y };
}

export function hasCrossedDragThreshold(x, y) {
  if (!dragStart) return false;
  const dx = x - dragStart.x;
  const dy = y - dragStart.y;
  return Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD;
}
