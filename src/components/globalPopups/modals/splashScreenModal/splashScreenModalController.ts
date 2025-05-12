import { createSplashScreenModal } from './splashScreenModalUI.js';
import { attachSplashScreenModalListeners } from './splashScreenModalListeners.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Controller for the Splash Screen Modal.
 * Handles lifecycle: show, hide, destroy.
 */
export class SplashScreenModalController {
  private modal: HTMLElement;
  private detachFn: (() => void) | null = null;

  private footerMain: HTMLElement | null;
  private contentMain: HTMLElement | null;
  private splashLogo: HTMLImageElement | null;

  constructor() {
    this.modal = createSplashScreenModal();
    document.body.appendChild(this.modal);

    const listeners: ListenerAttachment = attachSplashScreenModalListeners(this.modal);
    this.detachFn = listeners.detach;

    // Cache other UI elements
    this.footerMain = document.getElementById('footer-main');
    this.contentMain = document.getElementById('content-main');
    this.splashLogo = this.modal.querySelector('#splash-logo') as HTMLImageElement | null;
  }

  /**
   * Displays the splash screen and sets the logo.
   */
  public show(): void {
    // Update logo path dynamically
    if (this.splashLogo) {
      this.splashLogo.src = getAssetPath('static/logo.png');
    }

    // Show modal
    this.modal.classList.remove('hidden');
    this.modal.style.opacity = '1';

    // Hide main content while splash is active
    this.footerMain?.classList.remove('content-visible');
    this.footerMain?.classList.add('content-hidden');

    this.contentMain?.classList.remove('content-visible');
    this.contentMain?.classList.add('content-hidden');
  }

  /**
   * Hides the splash screen with a fade-out and reveals main content.
   * @param delayBeforeFadeMs - Optional delay before starting fade-out.
   */
  public hide(delayBeforeFadeMs = 1000): void {
    // Delay before fade-out starts
    setTimeout(() => {
      this.modal.style.opacity = '0';
      this.modal.style.transition = 'opacity 0.5s ease-out';

      // After fade-out completes
      setTimeout(() => {
        this.modal.classList.add('hidden');
        this.modal.style.opacity = '1';

        // Show main content
        this.footerMain?.classList.remove('content-hidden');
        this.footerMain?.classList.add('content-visible');

        this.contentMain?.classList.remove('content-hidden');
        this.contentMain?.classList.add('content-visible');
      }, 500); // Matches fade-out duration
    }, delayBeforeFadeMs);
  }

  /**
   * Detaches listeners and removes modal from DOM.
   */
  public destroy(): void {
    this.detachFn?.();
    this.modal.remove();
  }
}
