import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

import { openInstrumentSelectorModal } from '@/components/sequencer/services/instrumentSelectorService.js';

/**
 * Attaches the instrument selection button listener for a specific sequencer.
 */
export function attachInstrumentSelectListeners(
  button: HTMLButtonElement,
  sequencer: Sequencer
): ListenerAttachment {
  const handleClick = () => {
    openInstrumentSelectorModal(sequencer.id, sequencer.instrumentName);
  };

  button.addEventListener('click', handleClick);

  const refreshUI = () => {
    // Could update the label here if the instrument changes externally
    // e.g., buttonLabel.textContent = sequencer.instrumentShortName;
  };

  return {
    detach: () => {
      button.removeEventListener('click', handleClick);
    },
    refreshUI
  };
}
