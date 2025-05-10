// src/globalControls/modals/saveModal/saveModalListeners.ts

import { SaveLoadService } from '@/components/globalControls/services/SaveLoadService.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the Save Project modal.
 * Binds to buttons for exporting as JSON, WAV, or MIDI.
 */
export function attachSaveModalListeners(modal: HTMLElement, showWavModal: () => void): ListenerAttachment {
  const cancelBtn = modal.querySelector('#export-cancel') as HTMLButtonElement | null;
  const saveJsonBtn = modal.querySelector('#export-json') as HTMLButtonElement | null;
  const saveWavBtn = modal.querySelector('#export-wav') as HTMLButtonElement | null;
  const saveMidiBtn = modal.querySelector('#export-midi') as HTMLButtonElement | null;

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  const handleSave = async (format: 'json' | 'wav' | 'midi') => {
    if (format === 'wav') {
      closeModal();
      showWavModal();
    } else {
      await SaveLoadService.save(format);
      closeModal();
    }
  };

  cancelBtn?.addEventListener('click', closeModal);
  saveJsonBtn?.addEventListener('click', () => handleSave('json'));
  saveWavBtn?.addEventListener('click', () => handleSave('wav'));
  saveMidiBtn?.addEventListener('click', () => handleSave('midi'));

  return {
    detach: () => {
      cancelBtn?.removeEventListener('click', closeModal);
      saveJsonBtn?.removeEventListener('click', () => handleSave('json'));
      saveWavBtn?.removeEventListener('click', () => handleSave('wav'));
      saveMidiBtn?.removeEventListener('click', () => handleSave('midi'));
    },
    refreshUI: () => {}
  };
}
