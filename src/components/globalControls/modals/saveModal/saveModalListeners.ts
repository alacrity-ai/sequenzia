// src/components/globalControls/modals/saveModal/saveModalListeners.ts

import { SaveLoadService } from '@/components/globalControls/services/SaveLoadService.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { handleMidiDragStart } from '@/shared/services/exportMidiDragService.js';

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches behavior for the Save Project modal.
 * Binds to buttons for exporting as JSON, WAV, MIDI, and drag MIDI.
 */
export function attachSaveModalListeners(
  modalRoot: HTMLElement,
  dragMidiBtn: HTMLButtonElement,
  showWavModal: () => void
): ListenerAttachment {
  const cancelBtn = modalRoot.querySelector('#export-cancel') as HTMLButtonElement | null;
  const saveJsonBtn = modalRoot.querySelector('#export-json') as HTMLButtonElement | null;
  const saveWavBtn = modalRoot.querySelector('#export-wav') as HTMLButtonElement | null;
  const saveMidiBtn = modalRoot.querySelector('#export-midi') as HTMLButtonElement | null;

  let cleanupFn: (() => void) | null = null;

  const closeModal = () => {
    modalRoot.classList.add('hidden');
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

  // === Drag MIDI Entire Song Handlers ===
  const handleDragStart = (e: DragEvent) => {
    dragMidiBtn.classList.add('dragging');
    cleanupFn = handleMidiDragStart(e, getSequencers());
  };

  const handleDragEnd = () => {
    dragMidiBtn.classList.remove('dragging');
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  };

  dragMidiBtn.addEventListener('dragstart', handleDragStart);
  dragMidiBtn.addEventListener('dragend', handleDragEnd);

  return {
    detach: () => {
      cancelBtn?.removeEventListener('click', closeModal);
      saveJsonBtn?.removeEventListener('click', () => handleSave('json'));
      saveWavBtn?.removeEventListener('click', () => handleSave('wav'));
      saveMidiBtn?.removeEventListener('click', () => handleSave('midi'));
      dragMidiBtn.removeEventListener('dragstart', handleDragStart);
      dragMidiBtn.removeEventListener('dragend', handleDragEnd);
    },
    refreshUI: () => {}
  };
}
