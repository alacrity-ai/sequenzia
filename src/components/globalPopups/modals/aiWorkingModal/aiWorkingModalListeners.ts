import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches listeners to the AI Working Modal.
 * Currently no interactive elements, but provides detach + refreshUI contract.
 */
export function attachAIWorkingModalListeners(modal: HTMLElement): ListenerAttachment {
  // No interactive listeners needed, but maintaining contract structure.

  return {
    detach: () => {
      // Placeholder for future if we add cancel/abort buttons.
    },
    refreshUI: () => {
      // Placeholder: could be used for dynamic subtext updates later.
    }
  };
}
