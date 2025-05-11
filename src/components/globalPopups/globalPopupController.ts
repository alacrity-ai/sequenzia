// src/components/globalPopups/globalPopupController.ts

import { ErrorGenericModalController } from '@/components/globalPopups/modals/errorGenericModal/errorGenericModalController.js';
import { FeatureNotImplementedModalController } from '@/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalController.js';
import { LoadingModalController } from '@/components/globalPopups/modals/loadingModal/loadingModalController.js';

/**
 * Central lifecycle manager for all global popup modals (error, loading, feature-blocked, etc).
 */
export class GlobalPopupController {
  private errorModal!: ErrorGenericModalController;
  private featureModal!: FeatureNotImplementedModalController;
  private loadingModal!: LoadingModalController;

  private readonly onCancelLoading: () => void;

  constructor(onCancelLoading: () => void) {
    this.onCancelLoading = onCancelLoading;
    this.initialize();
  }

  private initialize(): void {
    this.errorModal = new ErrorGenericModalController();
    this.featureModal = new FeatureNotImplementedModalController();
    this.loadingModal = new LoadingModalController(this.onCancelLoading);
  }

  public showError(message: string): void {
    this.errorModal.show(message);
  }

  public showFeatureBlocked(): void {
    this.featureModal.show();
  }

  public showLoading(options?: {
    title?: string;
    subtext?: string;
    cancelable?: boolean;
  }): void {
    this.loadingModal.show(options);
  }

  public hideLoading(): void {
    this.loadingModal.hide();
  }

  public destroy(): void {
    this.errorModal?.destroy();
    this.featureModal?.destroy();
    this.loadingModal?.destroy();
  }

  public reload(): void {
    this.destroy();
    this.initialize();
  }
}
