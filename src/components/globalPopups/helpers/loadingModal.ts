// src/components/globalPopups/helpers/loadingModal.ts

import { isSplashScreenVisible } from '@/shared/modals/global/splashscreen.js';
import { popupsController } from '@/main.js';

let globalLoading = false;

/**
 * Shows the loading modal with optional title, subtext, and cancel handler.
 * If `global` is true, prevents other non-global loading modals from interrupting.
 */
export function showLoadingModal(
  title: string = "Loading Sounds...",
  subtext: string = "Please wait while we dial it in.",
  onCancel?: () => void,
  global?: boolean
): void {
  if (isSplashScreenVisible()) return;
  if (isGlobalLoading() && !global) return;

  if (global) {
    hideLoadingModal(); // hide any in-progress modal
    setGlobalLoading(true);
  }

  popupsController.showLoading({
    title,
    subtext,
    cancelable: !!onCancel
  });

  if (onCancel) {
    // Update the loading modal's internal cancel handler
    popupsController.destroy();
    popupsController.reload(); // rebind with latest cancel logic
  }
}

/**
 * Hides the loading modal. If `disableGlobal` is true, clears the global lock flag.
 */
export function hideLoadingModal(disableGlobal?: boolean): void {
  if (disableGlobal) {
    setGlobalLoading(false);
  }
  if (!isGlobalLoading()) {
    popupsController.hideLoading();
  }
}

/**
 * Global lock setter — use when showing system-critical modals.
 */
export function setGlobalLoading(loading: boolean): void {
  globalLoading = loading;
}

/**
 * Global lock checker.
 */
export function isGlobalLoading(): boolean {
  return globalLoading;
}
