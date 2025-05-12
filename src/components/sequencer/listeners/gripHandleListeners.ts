// src/components/sequencer/listeners/gripHandleListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { Grid } from '@/components/sequencer/matrix/Grid.js';

export function attachGripHandleListeners(
  gripHandle: HTMLElement,
  matrixContainer: HTMLElement,
  grid: Grid
): ListenerAttachment {
  let isDragging = false;
  let startY = 0;
  let startHeight = 0;

  const MIN_HEIGHT = 150;
  const MAX_HEIGHT = 1000;

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startY = e.clientY;
    startHeight = matrixContainer.offsetHeight;

    gripHandle.classList.replace('cursor-grab', 'cursor-grabbing');
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;
    let newHeight = startHeight + deltaY;
    newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

    matrixContainer.style.height = `${newHeight}px`;
    grid.resize();
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    isDragging = false;
    gripHandle.classList.replace('cursor-grabbing', 'cursor-grab');
    document.body.style.userSelect = '';
  };

  gripHandle.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return {
    detach: () => {
      gripHandle.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    },
    refreshUI: () => {
      // Optional: could toggle visibility here based on expanded/collapsed state
    }
  };
}
