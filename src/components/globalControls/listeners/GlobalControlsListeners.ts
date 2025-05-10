// src/globalControls/listeners/GlobalControlsListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { VelocityModalController } from '@/components/globalControls/modals/velocity/velocityModalController.js';

import { getActiveSelection } from '@/components/sequencer/utils/selectionTracker.js';
import { showErrorModal } from '@/shared/modals/global/errorGeneric.js';
import { isKeyboardListenersAttached } from '@/components/keyboard/input/keyboard-interaction.js';

/**
 * Attaches global-level control listeners (e.g. modals triggered via hotkeys or UI popovers).
 * These remain active regardless of the current UI context.
 */
export function attachGlobalControlsListeners(
  modals: {
    velocity: VelocityModalController;
    // future: chordifier, quantize, humanizer...
  }
): ListenerAttachment {
  // === Velocity Modal Logic (shared by key and click) ===
  const tryOpenVelocityModal = (): void => {
    const selection = getActiveSelection();
    if (!selection || selection.selectedNotes.length === 0) {
      showErrorModal('No notes selected. Please select notes before adjusting velocity.');
      return;
    }

    modals.velocity.show(selection.selectedNotes);
  };

  // === Hotkey Shortcut ===
  const handleVelocityShortcut = (e: KeyboardEvent): void => {
    if (e.key.toLowerCase() !== 'v' || e.ctrlKey || e.metaKey || e.altKey) return;

    const tag = (document.activeElement as HTMLElement)?.tagName;
    const isTypingContext = tag === 'INPUT' || tag === 'TEXTAREA';
    if (isTypingContext || isKeyboardListenersAttached()) return;

    e.preventDefault();
    tryOpenVelocityModal();
  };

  // === Dispatch Key Handler ===
  const handleKeydown = (e: KeyboardEvent): void => {
    handleVelocityShortcut(e);
    // add: handleChordifierShortcut(e), handleQuantizeShortcut(e), etc.
  };

  // === Handle Custom Events from UI (e.g. popovers) ===
  const handleEditorInvoke = (e: Event): void => {
    const { editorId } = (e as CustomEvent).detail;

    if (editorId === 'velocity-tool') {
      tryOpenVelocityModal();
    }

    // TODO: add more tool handlers as they are implemented
  };

  window.addEventListener('keydown', handleKeydown);
  document.body.addEventListener('editor-invoke', handleEditorInvoke);

  return {
    detach: () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.removeEventListener('editor-invoke', handleEditorInvoke);
    },
    refreshUI: () => {
      // No visual state to sync at present
    }
  };
}
