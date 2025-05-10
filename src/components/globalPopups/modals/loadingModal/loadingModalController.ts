// src/components/globalPopups/modals/loadingModal/loadingModalController.ts

import { createLoadingModal } from './loadingModalUI.js';
import { attachLoadingModalListeners } from './loadingModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

export class LoadingModalController {
  private modal: HTMLElement;
  private titleEl: HTMLElement;
  private subtextEl: HTMLElement;
  private cancelBtn: HTMLButtonElement;
  private detachFn: (() => void) | null = null;

  constructor(onCancel: () => void) {
    this.modal = createLoadingModal();
    this.titleEl = this.modal.querySelector('#loading-modal-title')!;
    this.subtextEl = this.modal.querySelector('#loading-modal-subtext')!;
    this.cancelBtn = this.modal.querySelector('#loading-modal-cancel') as HTMLButtonElement;
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachLoadingModalListeners(this.modal, onCancel);
    this.detachFn = listeners.detach;
  }

  public show(options?: { title?: string; subtext?: string; cancelable?: boolean }): void {
    if (options?.title) this.titleEl.textContent = options.title;
    if (options?.subtext) this.subtextEl.textContent = options.subtext;
    this.cancelBtn.classList.toggle('hidden', !options?.cancelable);

    this.modal.classList.remove('hidden');
    this.modal.style.opacity = '1';
  }

  public hide(): void {
    this.modal.classList.add('hidden');
    this.modal.style.opacity = '1';
  }

  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
