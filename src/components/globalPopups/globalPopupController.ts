// src/components/globalPopups/globalPopupController.ts

import { ErrorGenericModalController } from '@/components/globalPopups/modals/errorGenericModal/errorGenericModalController.js';
import { FeatureNotImplementedModalController } from '@/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalController.js';
import { LoadingModalController } from '@/components/globalPopups/modals/loadingModal/loadingModalController.js';
import { SplashScreenModalController } from '@/components/globalPopups/modals/splashScreenModal/splashScreenModalController.js';

/**
 * Central lifecycle manager for all global popup modals (error, loading, feature-blocked, splash, etc).
 */
export class GlobalPopupController {
  private errorModal!: ErrorGenericModalController;
  private featureModal!: FeatureNotImplementedModalController;
  private loadingModal!: LoadingModalController;
  private splashModal!: SplashScreenModalController;

  private readonly onCancelLoading: () => void;

  constructor(onCancelLoading: () => void) {
    this.onCancelLoading = onCancelLoading;
    this.initialize();
  }

  private initialize(): void {
    this.errorModal = new ErrorGenericModalController();
    this.featureModal = new FeatureNotImplementedModalController();
    this.loadingModal = new LoadingModalController(this.onCancelLoading);
    this.splashModal = new SplashScreenModalController();
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

  public showSplashScreen(): void {
    this.splashModal.show();
  }

  public hideSplashScreen(): void {
    this.splashModal.hide();
  }

  public destroy(): void {
    this.errorModal?.destroy();
    this.featureModal?.destroy();
    this.loadingModal?.destroy();
    this.splashModal?.destroy();
  }

  public reload(): void {
    this.destroy();
    this.initialize();
  }
}
