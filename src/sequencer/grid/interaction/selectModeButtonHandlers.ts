// src/sequencer/grid/interaction/selectModeButtonHandlers.ts

import { setupGlobalEditHotkeys } from './globalEditHotkeys.js';
import { performCopy, performCut, performPaste, performDelete } from './editActions.js';

export function setupSelectModeUI(): void {
  const copyBtn = document.querySelector<HTMLButtonElement>('.select-mode-copy');
  if (copyBtn) copyBtn.onclick = performCopy;

  const cutBtn = document.querySelector<HTMLButtonElement>('.select-mode-cut');
  if (cutBtn) cutBtn.onclick = performCut;

  const pasteBtn = document.querySelector<HTMLButtonElement>('.select-mode-paste');
  if (pasteBtn) pasteBtn.onclick = performPaste;

  const deleteBtn = document.querySelector<HTMLButtonElement>('.select-mode-delete');
  if (deleteBtn) deleteBtn.onclick = performDelete;

  setupGlobalEditHotkeys();
}
