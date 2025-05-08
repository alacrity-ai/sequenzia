// src/globalControls/listeners/GlobalMiniContourListeners.ts

import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';

export function attachContourListeners(container: HTMLElement): ListenerAttachment {
  const refreshUI = () => {
    // TODO: Update playhead position, sync zoom range, etc.
  };

  const handleExpandClick = () => {
    // TODO: Expand/collapse global mini contour
  };

  const expandBtn = container.querySelector('#global-mini-expand-btn');
  expandBtn?.addEventListener('click', handleExpandClick);

  return {
    detach: () => {
      expandBtn?.removeEventListener('click', handleExpandClick);
    },
    refreshUI
  };
}
