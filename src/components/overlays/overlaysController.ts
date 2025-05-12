// src/components/overlays/overlaysController.ts

import { DeleteConfirmModalController } from './modals/deleteConfirmModal/deleteConfirmModalController.js';
import { InstrumentSelectModalController } from './modals/instrumentSelectModal/instrumentSelectModalController.js';

/**
 * Central lifecycle manager for global overlays (modals, confirmations, etc).
 * Singleton instance accessed via getOverlaysController().
 */
class OverlaysController {
  private deleteConfirmModal!: DeleteConfirmModalController;
  private instrumentSelectModal!: InstrumentSelectModalController;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.deleteConfirmModal = new DeleteConfirmModalController();
    this.instrumentSelectModal = new InstrumentSelectModalController();
  }

  /**
   * Shows the Instrument Select Modal.
   * @param sequencerId - Target sequencer ID (or null for global instrument).
   * @param currentInstrument - Current instrument path e.g. 'sf2/fluidr3-gm/acoustic_grand_piano'.
   */
  public showInstrumentSelectModal(sequencerId: number | null, currentInstrument: string): void {
    this.instrumentSelectModal.show(sequencerId, currentInstrument);
  }

  /**
   * Shows the Delete Confirmation Modal.
   * @param onConfirm - Callback when user confirms deletion.
   * @param onCancel - Callback when user cancels.
   */
  public showDeleteConfirmModal(onConfirm: () => void, onCancel: () => void): void {
    this.deleteConfirmModal.show(onConfirm, onCancel);
  }

  /**
   * Destroys all managed overlays.
   */
  public destroy(): void {
    this.deleteConfirmModal?.destroy();
    this.instrumentSelectModal?.destroy();
  }

  /**
   * Re-initializes overlays (e.g., on reload).
   */
  public reload(): void {
    this.destroy();
    this.initialize();
  }
}

// Singleton instance
let overlaysControllerInstance: OverlaysController | null = null;

/**
 * Retrieves the global OverlaysController singleton.
 */
export function getOverlaysController(): OverlaysController {
  if (!overlaysControllerInstance) {
    overlaysControllerInstance = new OverlaysController();
  }
  return overlaysControllerInstance;
}
