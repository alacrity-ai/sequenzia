// src/sequencer/grid/interaction/sharedMouseListeners.ts

import { isPasteModeActive, handlePasteEvent } from '../../../setup/stores/pasteModeStore.js';
import { getClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../audio/pitch-utils.js';

import type { Note } from '../../interfaces/Note.js';
import type { HandlerContext } from '../../interfaces/HandlerContext.js';
import type { Grid } from '../../interfaces/Grid.js';

// --- Resize Handling ---

let hoveredResizeNote: Note | null = null;
let resizeState: {
  anchorNote: Note;
  startX: number;
  startY: number;
  originalDuration: number;
} | null = null;

export function setHoveredResizeNote(note: Note | null): void {
  hoveredResizeNote = note;
}

export function getHoveredResizeNote(): Note | null {
  return hoveredResizeNote;
}

export function clearHoveredResizeNote(): void {
  hoveredResizeNote = null;
}

export function startResizeMode(anchorNote: Note, startX: number, startY: number): void {
  resizeState = {
    anchorNote,
    startX,
    startY,
    originalDuration: anchorNote.duration,
  };
}

export function getResizeState(): typeof resizeState {
  return resizeState;
}

export function clearResizeState(): void {
  resizeState = null;
}

// --- Paste Preview Handling ---

/**
 * Update paste preview notes based on cursor position
 * Used in move handlers while paste mode is active
 */
export function updatePastePreview(ctx: HandlerContext, x: number, y: number): void {
  if (!ctx.setPastePreviewNotes) return;
  if (!isPasteModeActive()) {
    ctx.setPastePreviewNotes(null);
    return;
  }

  const { notes, anchorBeat, anchorMidi } = getClipboard();
  const snappedBeat = ctx.getSnappedBeatFromX(x);
  const pitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
  const midi = pitchToMidi(pitch);
  if (midi === null) return;

  const deltaBeat = snappedBeat - anchorBeat;
  const deltaMidi = midi - anchorMidi;

  const previewNotes: Note[] = notes.map(n => {
    const baseMidi = pitchToMidi(n.pitch);
    if (baseMidi === null) {
      return { ...n };
    }
    return {
      pitch: midiToPitch(baseMidi + deltaMidi) ?? n.pitch,
      start: n.start + deltaBeat,
      duration: n.duration
    };
  });

  ctx.setPastePreviewNotes(previewNotes);
  ctx.scheduleRedraw();
}

export function clearPastePreviewIfNeeded(ctx: HandlerContext): void {
  if (!ctx.setPastePreviewNotes) return;
  if (isPasteModeActive()) {
    ctx.setPastePreviewNotes(null);
  }
}

// --- Paste Click Intercepting ---

export function interceptPasteClickIfActive(ctx: HandlerContext, e: MouseEvent): boolean {
  if (isPasteModeActive()) {
    handlePasteEvent(ctx.grid as Grid, e);
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
}

// --- Dragging Gesture Handling ---

let dragStart: { x: number; y: number } | null = null;
const DRAG_THRESHOLD = 8;

export function resetMouseGestureState(): void {
  dragStart = null;
}

export function registerPotentialDragStart(x: number, y: number): void {
  dragStart = { x, y };
}

export function hasCrossedDragThreshold(x: number, y: number): boolean {
  if (!dragStart) return false;
  const dx = x - dragStart.x;
  const dy = y - dragStart.y;
  return Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD;
}
