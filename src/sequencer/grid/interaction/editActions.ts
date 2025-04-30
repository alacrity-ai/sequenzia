// src/sequencer/grid/interaction/editActions.ts

import { getClipboard, setClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../audio/pitch-utils.js';
import { getActiveGrid } from '../../../setup/stores/selectionTracker.js';
import { startPasteMode, endPasteMode } from '../../../setup/stores/pasteModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import {
  createDeleteNotesDiff,
  createReverseDeleteNotesDiff
} from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import {
  createCutNotesDiff,
  createReverseCutNotesDiff
} from '../../../appState/diffEngine/types/grid/cutNotes.js';
import {
  createPasteNotesDiff,
  createReversePasteNotesDiff
} from '../../../appState/diffEngine/types/grid/pasteNotes.js';
import {
  shouldAutoExitSelectMode,
  clearTemporarySelectModeFlag,
  setEditMode,
  EditModes
} from '../../../setup/stores/editModeStore.js';

import type { Note } from '../../interfaces/Note.js';
import type { Grid } from '../../interfaces/Grid.js';

export function performDelete(): void {
  const grid = getActiveGrid();
  if (!grid) return;

  const ctx = grid.gridContext;
  const selected = ctx.getSelectedNotes();
  if (selected.length === 0) return;

  recordDiff(
    createDeleteNotesDiff(ctx.sequencer.id, selected),
    createReverseDeleteNotesDiff(ctx.sequencer.id, selected)
  );

  if (shouldAutoExitSelectMode()) {
    clearTemporarySelectModeFlag();
    setEditMode(EditModes.NOTE_PLACEMENT);
  }

  ctx.setSelectedNotes([]);
}

export function performCopy(): void {
  const grid = getActiveGrid();
  if (!grid) return;

  const selected = grid.getSelectedNotes();
  if (selected.length === 0) return;

  setClipboard(selected);
}

export function performCut(): void {
  const grid = getActiveGrid();
  if (!grid) return;

  const ctx = grid.gridContext;
  const selected = ctx.getSelectedNotes();
  if (selected.length === 0) return;

  setClipboard(selected);

  recordDiff(
    createCutNotesDiff(ctx.sequencer.id, selected),
    createReverseCutNotesDiff(ctx.sequencer.id, selected)
  );

  if (shouldAutoExitSelectMode()) {
    clearTemporarySelectModeFlag();
    setEditMode(EditModes.NOTE_PLACEMENT);
  }

  ctx.setSelectedNotes([]);
}

export function performPaste(): void {
  const clipboard = getClipboard();
  if (!clipboard.notes.length) {
    return;
  }

  document.body.style.cursor = 'crosshair';

  startPasteMode((grid: Grid, e: MouseEvent) => {
    const ctx = grid.gridContext;
    const { x, y } = ctx.getCanvasPos(e);
    const clickedBeat = ctx.getSnappedBeatFromX(x);
    const clickedPitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const clickedMidi = pitchToMidi(clickedPitch);
    if (clickedMidi === null) return;
  
    const { notes, anchorBeat, anchorMidi } = getClipboard();
  
    const deltaBeat = clickedBeat - anchorBeat;
    const deltaMidi = clickedMidi - anchorMidi;
  
    const pasted: Note[] = notes.map(n => {
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
  
    recordDiff(
      createPasteNotesDiff(ctx.sequencer.id, pasted),
      createReversePasteNotesDiff(ctx.sequencer.id, pasted)
    );
  
    if (shouldAutoExitSelectMode()) {
      clearTemporarySelectModeFlag();
      setEditMode(EditModes.NOTE_PLACEMENT);
    }
  
    ctx.setSelectedNotes(pasted);
    document.body.style.cursor = 'default';
    endPasteMode();
  });  
}
