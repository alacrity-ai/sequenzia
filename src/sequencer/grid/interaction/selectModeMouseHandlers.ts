// src/sequencer/grid/interaction/selectModeMouseHandlers.ts

import { pitchToMidi, midiToPitch } from '../../../sounds/audio/pitch-utils.js';
import { EditModes, setEditMode, setSuppressNextNotePlacement, shouldAutoExitSelectMode, clearTemporarySelectModeFlag } from '../../../setup/stores/editModeStore.js';
import { getTotalBeats } from '../../transport.js';
import { registerSelectionStart } from '../../../setup/stores/selectionTracker.js';
import { getNotesInMarquee } from '../helpers/marquee.js';
import { updatePasteHoverGrid } from '../../../setup/stores/pasteModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createMoveNotesDiff, createReverseMoveNotesDiff } from '../../../appState/diffEngine/types/grid/moveNotes.js';
import { interceptPasteClickIfActive, updatePastePreview, clearPastePreviewIfNeeded } from './sharedMouseListeners.js';

import type { MouseHandler } from '../../interfaces/MouseHandler.js';
import type { HandlerContext } from '../../interfaces/HandlerContext.js';
import type { DragState } from '../../interfaces/DragState.js';

export function getSelectModeHandlers(ctx: HandlerContext): MouseHandler {
  let dragState: DragState | null = null;

  function contextHandler(e: MouseEvent): void {
    e.preventDefault();
    const { x, y } = ctx.getCanvasPos(e);
    const clicked = ctx.findNoteAt(x, y);
    if (!clicked) return;

    const selected = ctx.getSelectedNotes();
    const notesToDelete = selected.includes(clicked) ? selected : [clicked];
    if (!notesToDelete.length) return;

    ctx.setSelectedNotes([]);

    recordDiff(
      createDeleteNotesDiff(ctx.sequencer.id, notesToDelete),
      createReverseDeleteNotesDiff(ctx.sequencer.id, notesToDelete)
    );

    if (shouldAutoExitSelectMode()) {
      clearTemporarySelectModeFlag();
      setEditMode(EditModes.NOTE_PLACEMENT);
    }
  }

  function downHandler(e: MouseEvent): void {
    if (!ctx.grid) return;
    if (interceptPasteClickIfActive(ctx, e)) return;

    const { x, y } = ctx.getCanvasPos(e);
    if (x < 0) return;

    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered ?? null);

    registerSelectionStart(ctx.grid);

    const selectedNotes = ctx.getSelectedNotes();

    if (hovered && selectedNotes.includes(hovered)) {
      dragState = {
        startX: x,
        startY: y,
        anchorNote: hovered,
        initialNotes: selectedNotes.map(n => ({
          note: n,
          start: n.start,
          midi: pitchToMidi(n.pitch) ?? 0
        }))
      };
      return;
    }

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

  function moveHandler(e: MouseEvent): void {
    if (!ctx.grid) return;
    updatePasteHoverGrid(ctx.grid);
    const { x, y } = ctx.getCanvasPos(e);
  
    const hovered = ctx.findNoteAt(x, y);
    ctx.setHoveredNote(hovered ?? null);
  
    updatePastePreview(ctx, x, y);
  
    if (ctx.selectionBox?.active) {
      if (!ctx.setHighlightedNotes) return;
      ctx.selectionBox.currentX = x;
      ctx.selectionBox.currentY = y;
  
      const box = ctx.selectionBox;
  
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
  
    if (!dragState) return; // 💡 Move this guard up early
  
    // From here down, dragState is guaranteed not null
    const ds = dragState;
  
    const deltaX = x - ds.startX;
    const beatDelta = ctx.getSnappedBeatFromX(deltaX) - ctx.getSnappedBeatFromX(0);
    const deltaY = y - ds.startY;
    const pitchOffset = Math.round(deltaY / ctx.getCellHeight());
  
    const totalBeats = getTotalBeats();
    const minMidi = pitchToMidi(ctx.config.noteRange[0]) ?? 0;
    const maxMidi = pitchToMidi(ctx.config.noteRange[1]) ?? 127;
  
    for (const { note, start, midi } of ds.initialNotes) {
      const newStart = Math.max(0, start + beatDelta);
      const newMidi = Math.max(minMidi, Math.min(maxMidi, midi - pitchOffset));
      const newPitch = midiToPitch(newMidi) ?? note.pitch;
  
      if (newStart + note.duration <= totalBeats) {
        note.start = newStart;
        note.pitch = newPitch;
      }
    }
  
    const anchor = ds.initialNotes.find(n => n.note === ds.anchorNote);
    if (anchor) {
      const previewPitch = anchor.note.pitch;
      if (ds.lastPreviewPitch !== previewPitch) {
        ds.lastPreviewPitch = previewPitch;
        ctx.sequencer.playNote(previewPitch, 0.5);
      }
    }
  
    ctx.scheduleRedraw();
    ctx.onNotesChanged?.();
  }  

  function upHandler(e: MouseEvent): void {
    if (dragState?.initialNotes?.length) {
      const { initialNotes } = dragState;

      const from = initialNotes.map(({ start, midi, note }) => ({
        pitch: midiToPitch(midi) ?? note.pitch,
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

    if (ctx.selectionBox?.active) {
      if (!ctx.setHighlightedNotes) return;
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
        const selectedNow = ctx.getSelectedNotes();
        if (selectedNow.length === 0) {
          e.stopPropagation();
          clearTemporarySelectModeFlag();
          setEditMode(EditModes.NOTE_PLACEMENT);
          setSuppressNextNotePlacement();
        }
      }
      setSuppressNextNotePlacement();
    }
  }

  function leaveHandler(): void {
    if (!ctx.setHighlightedNotes) return;
    ctx.setHoveredNote(null);
    ctx.setHighlightedNotes([]);
    clearPastePreviewIfNeeded(ctx);
    ctx.scheduleRedraw();
  }

  return {
    attach(canvas: HTMLCanvasElement): void {
      canvas.addEventListener('mousedown', downHandler);
      canvas.addEventListener('mousemove', moveHandler);
      canvas.addEventListener('mouseup', upHandler);
      canvas.addEventListener('mouseleave', leaveHandler);
      canvas.addEventListener('contextmenu', contextHandler);
    },
    detach(canvas: HTMLCanvasElement): void {
      canvas.removeEventListener('mousedown', downHandler);
      canvas.removeEventListener('mousemove', moveHandler);
      canvas.removeEventListener('mouseup', upHandler);
      canvas.removeEventListener('mouseleave', leaveHandler);
      canvas.removeEventListener('contextmenu', contextHandler);
    }
  };
}
