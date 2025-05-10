// src/global/loadingModal.ts

import { isSplashScreenVisible } from './splashscreen.js';

let currentCancelHandler: (() => void) | null = null;
let globalLoading = false;

export function showLoadingModal(
  title: string = "Loading Sounds...",
  subtext: string = "Please wait while we dial it in.",
  onCancel?: () => void,
  global?: boolean
): void {
  if (isSplashScreenVisible()) return;
  if (isGlobalLoading() && !global) return;

  if (global) {
    // Hide any existing non-global loading modal
    hideLoadingModal();
    setGlobalLoading(true);
  }

  const modal = document.getElementById('loading-modal');
  const titleEl = document.getElementById('loading-modal-title');
  const subtextEl = document.getElementById('loading-modal-subtext');
  const cancelBtn = document.getElementById('loading-modal-cancel');

  if (titleEl) titleEl.textContent = title;
  if (subtextEl) subtextEl.textContent = subtext;

  if (cancelBtn) {
    if (onCancel) {
      cancelBtn.classList.remove('hidden');
      currentCancelHandler = () => {
        onCancel();
        setGlobalLoading(false);
        hideLoadingModal();
      };
      cancelBtn.onclick = currentCancelHandler;
    } else {
      cancelBtn.classList.add('hidden');
      cancelBtn.onclick = null;
      currentCancelHandler = null;
    }
  }

  if (modal) modal.classList.remove('hidden');
}

export function hideLoadingModal(disableGlobal?: boolean): void {
  if (disableGlobal) setGlobalLoading(false);
  if (isGlobalLoading()) return;
  const modal = document.getElementById('loading-modal');
  const cancelBtn = document.getElementById('loading-modal-cancel');

  if (modal) modal.classList.add('hidden');
  if (cancelBtn) {
    cancelBtn.classList.add('hidden');
    cancelBtn.onclick = null;
  }

  currentCancelHandler = null;
}

export function setGlobalLoading(loading: boolean): void {
  globalLoading = loading;
}

export function isGlobalLoading(): boolean {
  return globalLoading;
}