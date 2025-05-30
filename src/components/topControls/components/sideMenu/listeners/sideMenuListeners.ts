// src/components/sideMenu/listeners/sideMenuListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import { getGlobalPopupController } from '@/components/globalPopups/globalPopupController.js';

/**
 * Attaches event listeners for side menu buttons (piano, mixer, AI).
 * Each currently triggers the "Feature Not Implemented" modal.
 */
export function attachSideMenuListeners(container: HTMLElement): ListenerAttachment {
  const pianoBtn = container.querySelector('#piano-toggle-btn') as HTMLButtonElement | null;
  const mixerBtn = container.querySelector('#mixer-toggle-btn') as HTMLButtonElement | null;
  const aiBtn = container.querySelector('#ai-toggle-btn') as HTMLButtonElement | null;

  const handlePiano = () => {
    const popupsController = getGlobalPopupController();
    popupsController.showFeatureBlocked();
  };

  const handleMixer = () => {
    const popupsController = getGlobalPopupController();
    popupsController.showFeatureBlocked();
  };

  const handleAI = () => {
    const popupsController = getGlobalPopupController();
    popupsController.showFeatureBlocked();
  };

  pianoBtn?.addEventListener('click', handlePiano);
  mixerBtn?.addEventListener('click', handleMixer);
  aiBtn?.addEventListener('click', handleAI);

  return {
    detach: () => {
      pianoBtn?.removeEventListener('click', handlePiano);
      mixerBtn?.removeEventListener('click', handleMixer);
      aiBtn?.removeEventListener('click', handleAI);
    },
    refreshUI: () => {}
  };
}
