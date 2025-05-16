import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { VelocityModalController } from '@/components/globalControls/modals/velocity/velocityModalController.js';

import {
  setSnapToKeyOverrideActive,
  isSnapToKeyOverrideActive
} from '@/shared/stores/songInfoStore.js';

import { isKeyboardInputEnabled } from '@/components/topControls/components/keyboard/services/keyboardService.js';
import { getActiveSelection } from '@/components/sequencer/utils/selectionTracker.js';
import { getGlobalPopupController } from '@/components/globalPopups/globalPopupController.js';
import { matchesMacro } from '@/shared/keybindings/useKeyMacro';


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
    const popupsController = getGlobalPopupController();
    const selection = getActiveSelection();
    if (!selection || selection.selectedNotes.length === 0) {
      popupsController.showError('No notes selected. Please select notes before adjusting velocity.');
      return;
    }

    modals.velocity.show(selection.selectedNotes);
  };

  // === Hotkey Shortcuts ===
  const handleVelocityShortcut = (e: KeyboardEvent): void => {
    if (!matchesMacro(e, 'ToggleVelocityTool')) return

    const tag = (document.activeElement as HTMLElement)?.tagName;
    const isTypingContext = tag === 'INPUT' || tag === 'TEXTAREA';
    const isIncompatibleContext = isKeyboardInputEnabled();

    if (isTypingContext || isIncompatibleContext) return;

    e.preventDefault();
    tryOpenVelocityModal();
  };

  // === Snap-to-Key Override Shortcut (CTRL down to disable in-key snapping temporarily)
  const handleSnapToKeyShortcut = (e: KeyboardEvent): void => {
    if (!matchesMacro(e, 'GridSnapOverride')) return;

    if (e.type === 'keydown' && e.ctrlKey && !isSnapToKeyOverrideActive()) {
      setSnapToKeyOverrideActive(true);
    }

    if (e.type === 'keyup' && e.key === 'Control' && isSnapToKeyOverrideActive()) {
      setSnapToKeyOverrideActive(false);
    }
  };

  // === Dispatch Key Handler ===
  const handleKeydown = (e: KeyboardEvent): void => {
    handleVelocityShortcut(e);
    handleSnapToKeyShortcut(e);
    // add: handleChordifierShortcut(e), handleQuantizeShortcut(e), etc.
  };

  const handleKeyup = (e: KeyboardEvent): void => {
    handleSnapToKeyShortcut(e);
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
  window.addEventListener('keyup', handleKeyup);
  document.body.addEventListener('editor-invoke', handleEditorInvoke);

  return {
    detach: () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
      document.body.removeEventListener('editor-invoke', handleEditorInvoke);
    },
    refreshUI: () => {
      // No visual state to sync at present
    }
  };
}
