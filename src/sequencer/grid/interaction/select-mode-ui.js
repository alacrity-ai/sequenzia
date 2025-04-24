import { setClipboard, getClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getActiveGrid } from '../../../setup/selectionTracker.js';
import { startPasteMode, endPasteMode } from '../../../setup/pasteModeStore.js';
import { getEditMode, EditModes } from '../../../setup/editModeStore.js';
import { recordDiff } from '../../../appState/appState.js';
import { createDeleteNotesDiff, createReverseDeleteNotesDiff } from '../../../appState/diffEngine/types/grid/deleteNotes.js';
import { createCutNotesDiff, createReverseCutNotesDiff } from '../../../appState/diffEngine/types/grid/cutNotes.js';
import { createPasteNotesDiff, createReversePasteNotesDiff } from '../../../appState/diffEngine/types/grid/pasteNotes.js';

export function setupSelectModeUI() {
  let isPasting = false;

  // === HOTKEY SUPPORT ===
  document.addEventListener('keydown', (e) => {
    // Only enable shortcuts in select mode
    if (getEditMode() !== EditModes.SELECT) return;
  
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
  
    // Ignore if the user is typing in a field
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  
    const grid = getActiveGrid();
    if (!grid) return;
  
    switch (true) {
      case (ctrlKey && e.key === 'c'):
        e.preventDefault();
        copyBtn?.click();
        break;
      case (ctrlKey && e.key === 'x'):
        e.preventDefault();
        cutBtn?.click();
        break;
      case (ctrlKey && e.key === 'v'):
        e.preventDefault();
        pasteBtn?.click();
        break;
      case (e.key === 'Delete'):
        e.preventDefault();
        deleteBtn?.click();
        break;
    }
  });

  const deleteBtn = document.querySelector('.select-mode-delete');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      const grid = getActiveGrid();
      if (!grid) return;
  
      const ctx = grid.gridContext;
      const selected = ctx.getSelectedNotes();
      if (selected.length === 0) return;
  
      // Use state-driven model — do not mutate ctx.notes directly
      recordDiff(
        createDeleteNotesDiff(ctx.sequencer.id, selected),
        createReverseDeleteNotesDiff(ctx.sequencer.id, selected)
      );
  
      ctx.setSelectedNotes([]);
    };
  }

  const copyBtn = document.querySelector('.select-mode-copy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const grid = getActiveGrid();
      if (!grid) return;
      const selected = grid.getSelectedNotes();
      if (selected.length === 0) return;
      setClipboard(selected);
    };
  }

  const cutBtn = document.querySelector('.select-mode-cut');
  if (cutBtn) {
    cutBtn.onclick = () => {
      const grid = getActiveGrid();
      if (!grid) return;
  
      const ctx = grid.gridContext;
      const selected = ctx.getSelectedNotes();
      if (selected.length === 0) return;
  
      // Clipboard gets populated (we don't undo clipboard state)
      setClipboard(selected);
  
      // Diff-based deletion
      recordDiff(
        createCutNotesDiff(ctx.sequencer.id, selected),
        createReverseCutNotesDiff(ctx.sequencer.id, selected)
      );
  
      ctx.setSelectedNotes([]);
    };
  }

  const pasteBtn = document.querySelector('.select-mode-paste');
  if (pasteBtn) {
    pasteBtn.onclick = () => {
      const clipboard = getClipboard();
      if (!clipboard.notes.length) return;
  
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
      
        // 🧠 Diff-based insertion
        recordDiff(
          createPasteNotesDiff(ctx.sequencer.id, pasted),
          createReversePasteNotesDiff(ctx.sequencer.id, pasted)
        );
      
        ctx.setSelectedNotes(pasted);
        document.body.style.cursor = 'default';
        endPasteMode();
      });
    };
  }
}
