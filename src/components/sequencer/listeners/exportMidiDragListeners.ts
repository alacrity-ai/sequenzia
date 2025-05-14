// src/components/sequencer/listeners/exportMidiDragListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

import { handleMidiDragStart } from '@/shared/services/exportMidiDragService.js';
import { devLog } from '@/shared/state/devMode';

/**
 * Attaches the drag-to-DAW MIDI export listener for a specific sequencer.
 */
export function attachExportMidiDragListeners(
  button: HTMLButtonElement,
  sequencer: Sequencer
): ListenerAttachment {
  let cleanupFn: (() => void) | null = null;

  const handleDragStart = (e: DragEvent) => {
    button.classList.add('dragging');
    devLog(`[ExportMidiDrag] dragstart fired for sequencer ${sequencer.id}`);
    cleanupFn = handleMidiDragStart(e, [sequencer]);
  };

  const handleDragEnd = () => {
    devLog(`[ExportMidiDrag] dragend for sequencer ${sequencer.id}`);
    button.classList.remove('dragging');

    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  };

  button.addEventListener('dragstart', handleDragStart);
  button.addEventListener('dragend', handleDragEnd);

  return {
    detach: () => {
      button.removeEventListener('dragstart', handleDragStart);
      button.removeEventListener('dragend', handleDragEnd);
    },
    refreshUI: () => {}
  };
}
