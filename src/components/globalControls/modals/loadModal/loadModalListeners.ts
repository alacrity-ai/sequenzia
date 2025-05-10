// src/globalControls/modals/loadModal/loadModalListeners.ts

import { SaveLoadService } from '@/components/globalControls/services/SaveLoadService.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the Load Project modal.
 * Binds to buttons for loading .json or .midi files.
 */
export function attachLoadModalListeners(modal: HTMLElement): ListenerAttachment {
  const cancelBtn = modal.querySelector('#import-cancel') as HTMLButtonElement | null;
  const loadJsonBtn = modal.querySelector('#import-json') as HTMLButtonElement | null;
  const importMidiBtn = modal.querySelector('#import-midi') as HTMLButtonElement | null;

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  const handleFileLoad = async (accept: string[]) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept.join(',');
    input.onchange = async () => {
      if (input.files?.[0]) {
        await SaveLoadService.load(input.files[0]);
        closeModal();
      }
    };
    input.click();
  };

  const handleJsonLoad = () => handleFileLoad(['.json']);
  const handleMidiLoad = () => handleFileLoad(['.mid', '.midi']);

  // Attach listeners
  cancelBtn?.addEventListener('click', closeModal);
  loadJsonBtn?.addEventListener('click', handleJsonLoad);
  importMidiBtn?.addEventListener('click', handleMidiLoad);

  return {
    detach: () => {
      cancelBtn?.removeEventListener('click', closeModal);
      loadJsonBtn?.removeEventListener('click', handleJsonLoad);
      importMidiBtn?.removeEventListener('click', handleMidiLoad);
    },
    refreshUI: () => {}
  };
}
