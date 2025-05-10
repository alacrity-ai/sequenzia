import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';

export function showSplashScreen(): void {
    const modalMountRoot = document.getElementById('modal-mount-root');
    const splashModal = document.getElementById('splash-modal');
    const splashLogo = document.getElementById('splash-logo') as HTMLImageElement | null;
  
    // Remove hidden from the modal mount root
    if (modalMountRoot) {
      modalMountRoot.classList.remove('content-hidden');
      modalMountRoot.classList.add('content-visible');
    }
  
    if (splashLogo) {
      splashLogo.src = getAssetPath('static/logo.png');
    }
  
    splashModal?.classList.remove('hidden');
}
  
export function hideSplashScreen(delayBeforeFadeMs = 1000): void {
    const splashModal = document.getElementById('splash-modal');
    const footerMain = document.getElementById('footer-main');
    const contentMain = document.getElementById('content-main');
  
    if (splashModal) {
      // Wait before starting the fade
      setTimeout(() => {
        splashModal.style.opacity = '0';
        splashModal.style.transition = 'opacity 0.5s ease-out';
  
        // After fade-out is done
        setTimeout(() => {
          splashModal.classList.add('hidden');
          splashModal.style.opacity = '1';
  
          // Reveal the main content
          if (footerMain) {
            footerMain.classList.remove('content-hidden');
            footerMain.classList.add('content-visible');
          }
          if (contentMain) {
            contentMain.classList.remove('content-hidden');
            contentMain.classList.add('content-visible');
          }
  
        }, 500); // matches the fade duration
      }, delayBeforeFadeMs);
    }
  }
  
  

export function isSplashScreenVisible(): boolean {
    const splashModal = document.getElementById('splash-modal');
    return splashModal ? !splashModal.classList.contains('hidden') : false;
}
  