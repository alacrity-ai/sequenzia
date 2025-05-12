import { ErrorGenericModalController } from '@/components/globalPopups/modals/errorGenericModal/errorGenericModalController.js';
import { FeatureNotImplementedModalController } from '@/components/globalPopups/modals/featureNotImplementedModal/featureNotImplementedModalController.js';
import { LoadingModalController } from '@/components/globalPopups/modals/loadingModal/loadingModalController.js';
import { SplashScreenModalController } from '@/components/globalPopups/modals/splashScreenModal/splashScreenModalController.js';
import { OpenAIKeyNotSetModalController } from '@/components/globalPopups/modals/openaiKeyNotSetModal/openaiKeyNotSetModalController.js';
import { AIWorkingModalController } from '@/components/globalPopups/modals/aiWorkingModal/aiWorkingModalController.js';
import { AIGenerationFailedModalController } from '@/components/globalPopups/modals/aiGenerationFailedModal/aiGenerationFailedModalController.js';

/**
 * Central lifecycle manager for all global popup modals (error, loading, feature-blocked, splash, etc).
 */
export class GlobalPopupController {
  private errorModal!: ErrorGenericModalController;
  private featureModal!: FeatureNotImplementedModalController;
  private loadingModal!: LoadingModalController;
  private splashModal!: SplashScreenModalController;
  private openAIKeyNotSetModal!: OpenAIKeyNotSetModalController;
  private aiWorkingModal!: AIWorkingModalController;
  private aiGenerationFailedModal!: AIGenerationFailedModalController;

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
    this.openAIKeyNotSetModal = new OpenAIKeyNotSetModalController();
    this.aiWorkingModal = new AIWorkingModalController();
    this.aiGenerationFailedModal = new AIGenerationFailedModalController();
  }

  public showError(message: string): void {
    this.errorModal.show(message);
  }

  public showFeatureBlocked(): void {
    this.featureModal.show();
  }

  public showOpenAIKeyNotSet(): void {
    this.openAIKeyNotSetModal.show();
  }

  public showAIWorking(): void {
    this.aiWorkingModal.show();
  }

  public hideAIWorking(): void {
    this.aiWorkingModal.hide();
  }

  public showAIGenerationFailed(): void {
    this.aiGenerationFailedModal.show();
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
    this.openAIKeyNotSetModal?.destroy();
    this.aiWorkingModal?.destroy();
    this.aiGenerationFailedModal?.destroy();
  }

  public reload(): void {
    this.destroy();
    this.initialize();
  }
}

// === Singleton Accessor ===
let globalPopupControllerInstance: GlobalPopupController | null = null;

/**
 * Retrieves the global singleton instance of GlobalPopupController.
 * Will lazily instantiate it on first call.
 */
export function getGlobalPopupController(): GlobalPopupController {
  if (!globalPopupControllerInstance) {
    globalPopupControllerInstance = new GlobalPopupController(() => {
      console.warn('User cancelled loading.');
    });
  }
  return globalPopupControllerInstance;
}
