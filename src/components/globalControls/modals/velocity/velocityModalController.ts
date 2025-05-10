// src/components/globalControls/modals/velocity/velocityModalController.ts

import { createVelocityModal } from '@/components/globalControls/modals/velocity/velocityModalUI.js';
import { attachVelocityModalListeners, showVelocityModal } from '@/components/globalControls/modals/velocity/velocityModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { Note } from '@/shared/interfaces/Note.js';

export class VelocityModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createVelocityModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachVelocityModalListeners(this.modal);
    this.detachFn = listeners.detach;
  }

  /**
   * Show the modal and populate it with the current selected notes.
   * @param notes - The notes to modify
   */
  public show(notes: Note[]): void {
    showVelocityModal(notes);
  }

  public hide(): void {
    this.modal.classList.add('hidden');
  }

  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
