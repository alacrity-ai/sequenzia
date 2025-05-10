// src/globalControls/listeners/GlobalControlsListeners.ts

import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';
import { getActiveSelection } from '@/sequencer/utils/selectionTracker.js';
import { showVelocityModal } from '@/sequencer/ui/modals/velocity/velocityModeMenu.js';
import { showErrorModal } from '@/global/errorGeneric.js';
import { isKeyboardListenersAttached } from '@/keyboard/input/keyboard-interaction.js';

/**
 * Attaches global-level control listeners (e.g. velocity shortcut),
 * which remain active regardless of the current Toolbar submenu.
 */
export function attachGlobalControlsListeners(): ListenerAttachment {
  const handleKeydown = (e: KeyboardEvent) => {
    const tag = (document.activeElement as HTMLElement)?.tagName;
    const isTypingContext = tag === 'INPUT' || tag === 'TEXTAREA';

    if (isTypingContext || isKeyboardListenersAttached()) return;

    // === VELOCITY SHORTCUT ===
    if (
      e.key.toLowerCase() === 'v' &&
      !e.ctrlKey && !e.metaKey && !e.altKey
    ) {
      const selection = getActiveSelection();
      if (!selection || selection.selectedNotes.length === 0) {
        showErrorModal('No notes selected. Please select notes before adjusting velocity.');
        return;
      }

      e.preventDefault();
      showVelocityModal(selection.selectedNotes);
    }
  };

  window.addEventListener('keydown', handleKeydown);

  return {
    detach: () => {
      window.removeEventListener('keydown', handleKeydown);
    },
    refreshUI: () => {
      // No visual elements to refresh
    }
  };
}
