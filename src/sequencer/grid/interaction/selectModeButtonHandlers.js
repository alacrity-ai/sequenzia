// src/sequencer/grid/interaction/selectModeButtonHandlers.js
import { setupGlobalEditHotkeys } from './globalEditHotkeys.js';
import { performCopy, performCut, performPaste, performDelete } from './editActions.js';

export function setupSelectModeUI() {
  // Wire buttons to existing shared action logic, if they exist
  const copyBtn = document.querySelector('.select-mode-copy');
  if (copyBtn) copyBtn.onclick = performCopy;

  const cutBtn = document.querySelector('.select-mode-cut');
  if (cutBtn) cutBtn.onclick = performCut;

  const pasteBtn = document.querySelector('.select-mode-paste');
  if (pasteBtn) pasteBtn.onclick = performPaste;

  const deleteBtn = document.querySelector('.select-mode-delete');
  if (deleteBtn) deleteBtn.onclick = performDelete;

  // ✅ Now safe: hotkeys always available regardless of button presence
  setupGlobalEditHotkeys();
}
