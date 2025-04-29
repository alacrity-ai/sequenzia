export function showSplashScreen(): void {
    document.getElementById('splash-modal')?.classList.remove('hidden');
  }
  
  export function hideSplashScreen(): void {
    const splashModal = document.getElementById('splash-modal');
    if (splashModal) {
      splashModal.style.opacity = '0';
      splashModal.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        splashModal.classList.add('hidden');
        splashModal.style.opacity = '1';
      }, 500);
    }
  }
  
  // Add a helper function to check if splash screen is visible
  export function isSplashScreenVisible(): boolean {
    const splashModal = document.getElementById('splash-modal');
    return splashModal ? !splashModal.classList.contains('hidden') : false;
  }
  