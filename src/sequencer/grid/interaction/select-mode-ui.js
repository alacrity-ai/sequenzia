import { setClipboard, getClipboard } from '../../clipboard.js';
import { pitchToMidi, midiToPitch } from '../../../helpers.js';
import { getActiveGrid } from '../../../setup/selectionTracker.js';
import { startPasteMode, endPasteMode } from '../../../setup/pasteModeStore.js';
import { getEditMode, EditModes } from '../../../setup/editModeStore.js'; // ⬅️ Add this at the top if not already


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
      const selected = grid.getSelectedNotes();
      if (selected.length === 0) return;

      for (const note of selected) {
        const idx = ctx.notes.indexOf(note);
        if (idx !== -1) ctx.notes.splice(idx, 1);
      }

      ctx.setSelectedNotes([]);
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
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
      const selected = grid.getSelectedNotes();
      if (selected.length === 0) return;

      setClipboard(selected);

      for (const note of selected) {
        const idx = ctx.notes.indexOf(note);
        if (idx !== -1) ctx.notes.splice(idx, 1);
      }

      ctx.setSelectedNotes([]);
      ctx.scheduleRedraw();
      ctx.onNotesChanged?.();
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
  
        const { notes, anchorBeat, anchorMidi } = clipboard;
        const deltaBeat = clickedBeat - anchorBeat;
        const deltaMidi = clickedMidi - anchorMidi;
  
        const pasted = notes.map(n => ({
          pitch: midiToPitch(pitchToMidi(n.pitch) + deltaMidi),
          start: n.start + deltaBeat,
          duration: n.duration
        }));
  
        ctx.notes.push(...pasted);
        ctx.setSelectedNotes(pasted);
        ctx.scheduleRedraw();
        ctx.onNotesChanged?.();
  
        document.body.style.cursor = 'default';
        endPasteMode(); // ✅ properly ends paste mode
      });
    };
  }
}
