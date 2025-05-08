// src/globalControls/listeners/GlobalToolbarListeners.ts

import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';

export function attachToolbarListeners(container: HTMLElement): ListenerAttachment {
  const noteModeBtn = container.querySelector('#note-mode-btn');
  const aiModeBtn = container.querySelector('#ai-mode-btn');

  const refreshUI = () => {
    // TODO: Update active state, toggle visible panels, etc.
  };

  const handleNoteMode = () => {
    // TODO: Switch to Note mode
  };

  const handleAiMode = () => {
    // TODO: Switch to AI mode
  };

  noteModeBtn?.addEventListener('click', handleNoteMode);
  aiModeBtn?.addEventListener('click', handleAiMode);

  return {
    detach: () => {
      noteModeBtn?.removeEventListener('click', handleNoteMode);
      aiModeBtn?.removeEventListener('click', handleAiMode);
    },
    refreshUI
  };
}
