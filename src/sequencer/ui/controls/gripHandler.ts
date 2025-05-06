import type { Grid } from '../../matrix/Grid.js';
import { ListenerRegistry } from '../../../setup/stores/ListenerRegistry.js';

export function setupSequencerGripHandler(
    sequencerElement: HTMLElement,
    matrix: Grid,
    registry: ListenerRegistry
  ): void {
    const gripHandle = sequencerElement.querySelector('.cursor-grab') as HTMLElement | null;
    if (!gripHandle) return;
  
    const body = sequencerElement.querySelector('.sequencer-body') as HTMLElement | null;
    if (!body) return;
  
    let isDragging = false;
    let startY = 0;
    let startHeight = 0;
  
    const MIN_HEIGHT = 150;
    const MAX_HEIGHT = 1000;
  
    registry.on(gripHandle, 'mousedown', (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startHeight = body.offsetHeight;
      gripHandle.classList.replace('cursor-grab', 'cursor-grabbing');
      document.body.style.userSelect = 'none';
    });
  
    registry.on(window, 'mousemove', (e: MouseEvent) => {
      if (!isDragging) return;
  
      const deltaY = e.clientY - startY;
      let newHeight = startHeight + deltaY;
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
      body.style.height = `${newHeight}px`;
  
      matrix.resize(); // Notify grid
    });
  
    registry.on(window, 'mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      gripHandle.classList.replace('cursor-grabbing', 'cursor-grab');
      document.body.style.userSelect = '';
    });
  }

/**
 * Shows or hides the vertical grip resizer for the sequencer.
 */
export function toggleSequencerGripHandle(wrapper: HTMLElement, show: boolean): void {
  wrapper.querySelector('.cursor-grab')?.classList.toggle('hidden', !show);
}
  