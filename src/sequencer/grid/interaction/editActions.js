// src/sequencer/grid/interaction/editActions.js
import { getClipboard, setClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../audio/pitch-utils.js';
import { getActiveGrid } from '../../../setup/selectionTracker.js';
import { startPasteMode, endPasteMode } from '../../../setup/pasteModeStore.js';
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
  shouldAutoExitSelectMode, clearTemporarySelectModeFlag,
  setEditMode, EditModes
} from '../../../setup/editModeStore.js';

export function performDelete() {
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

export function performCopy() {
  console.log('performCopy called')
  const grid = getActiveGrid();
  if (!grid) return;
  const selected = grid.getSelectedNotes();
  if (selected.length === 0) return;
  setClipboard(selected);
}

export function performCut() {
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

export function performPaste() {
  console.log('performPaste called')
  const clipboard = getClipboard();
  if (!clipboard.notes.length) {
    console.log('No notes in clipboard');
    return;
  }

  document.body.style.cursor = 'crosshair';

  startPasteMode((grid, e) => {
    const ctx = grid.gridContext;
    const { x, y } = ctx.getCanvasPos(e);
    const clickedBeat = ctx.getSnappedBeatFromX(x);
    const clickedPitch = ctx.getPitchFromRow(Math.floor(y / ctx.getCellHeight()));
    const clickedMidi = pitchToMidi(clickedPitch);

    const { notes, anchorBeat, anchorMidi } = getClipboard();
    const deltaBeat = clickedBeat - anchorBeat;
    const deltaMidi = clickedMidi - anchorMidi;

    const pasted = notes.map(n => ({
      pitch: midiToPitch(pitchToMidi(n.pitch) + deltaMidi),
      start: n.start + deltaBeat,
      duration: n.duration
    }));

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
