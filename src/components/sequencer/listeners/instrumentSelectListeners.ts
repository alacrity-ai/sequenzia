// src/components/sequencer/listeners/instrumentSelectListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

import { getOverlaysController } from '@/components/overlays/overlaysController.js';

/**
 * Attaches the instrument selection button listener for a specific sequencer.
 */
export function attachInstrumentSelectListeners(
  button: HTMLButtonElement,
  sequencer: Sequencer
): ListenerAttachment {
  const handleClick = () => {
    getOverlaysController().showInstrumentSelectModal(sequencer.id, sequencer.instrumentName);
  };

  button.addEventListener('click', handleClick);

  const refreshUI = () => {};

  return {
    detach: () => {
      button.removeEventListener('click', handleClick);
    },
    refreshUI
  };
}
