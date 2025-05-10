// src/globalControls/listeners/GlobalSideButtonsListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { WhatsNewModalController } from '@/components/globalControls/modals/whatsNew/whatsNewModalController.js';

export function attachSideButtonListeners(container: HTMLElement, whatsNewModal: WhatsNewModalController): ListenerAttachment {
  const helpBtn = container.querySelector('#footer-help-btn');
  const whatsNewBtn = container.querySelector('#footer-whats-new-btn');

  const refreshUI = () => {
    // TODO: Possibly update button state (e.g., notification badge?)
  };

  const handleHelpClick = () => {
    // TODO: Open help modal or external documentation
  };

  const handleWhatsNewClick = () => {
    whatsNewModal.show();
  };

  helpBtn?.addEventListener('click', handleHelpClick);
  whatsNewBtn?.addEventListener('click', handleWhatsNewClick);

  return {
    detach: () => {
      helpBtn?.removeEventListener('click', handleHelpClick);
      whatsNewBtn?.removeEventListener('click', handleWhatsNewClick);
    },
    refreshUI
  };
}
