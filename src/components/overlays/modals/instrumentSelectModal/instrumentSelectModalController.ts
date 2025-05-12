import { createInstrumentSelectModal } from './instrumentSelectModalUI.js';
import { attachInstrumentSelectModalListeners } from './instrumentSelectModalListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Controller for managing the Instrument Select Modal.
 * Handles lifecycle, population, and confirm/cancel flows.
 */
export class InstrumentSelectModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  constructor() {
    this.modal = createInstrumentSelectModal();
    document.body.appendChild(this.modal);
  }

  /**
   * Shows the Instrument Select Modal.
   * @param sequencerId - Target sequencer ID (or null for global instrument).
   * @param currentInstrument - Current instrument full path, e.g. 'sf2/fluidr3-gm/acoustic_grand_piano'.
   */
  public show(sequencerId: number | null, currentInstrument: string): void {
    // Detach existing listeners first
    this.detachFn?.();

    const listeners = attachInstrumentSelectModalListeners(this.modal, {
      sequencerId,
      currentInstrument,
      hide: () => this.hide()
    });

    this.detachFn = listeners.detach;

    // Show modal
    this.modal.classList.remove('hidden');
  }

  /**
   * Immediately hides the modal.
   */
  public hide(): void {
    this.modal.classList.add('hidden');
  }

  /**
   * Detaches listeners and removes modal from DOM.
   */
  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
