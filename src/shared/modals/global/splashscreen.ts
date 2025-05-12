// src/shared/modals/global/splashscreen.ts

export function isSplashScreenVisible(): boolean {
  const splashModal = document.getElementById('splash-modal');
  return splashModal ? !splashModal.classList.contains('hidden') : false;
}
