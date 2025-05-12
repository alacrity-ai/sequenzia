// src/components/globalPopups/modals/splashScreenModal/splashScreenModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches listeners to the Splash Screen modal.
 * (Usually splash screens auto-dismiss, but this gives us structure for future interactivity.)
 */
export function attachSplashScreenModalListeners(modal: HTMLElement): ListenerAttachment {
  // Example: Future enhancement—allow dismiss by click, ESC, etc.
  // For now, this is a placeholder for symmetry & possible future features.

  const detach = () => {
    // Nothing to detach yet, but structure is here for consistency.
  };

  const refreshUI = () => {
    // No dynamic state to refresh (yet).
  };

  return { detach, refreshUI };
}
