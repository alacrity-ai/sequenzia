import { isDevMode, enableDevMode, disableDevMode } from '../state/devMode.js';
import { getAllDevTools } from './tools/index.js';

const STORAGE_KEY = 'SEQUENZIA_DEV';

declare global {
  interface Window {
    toggleDevMode?: () => void;
    DEVTOOLS?: Record<string, unknown>;
  }
}

export function registerDevTools(): void {
  if (typeof window === 'undefined') return;

  // Restore persisted dev mode
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true' && !isDevMode()) {
    enableDevMode();
    console.info('[SEQUENZIA] Dev mode re-enabled from localStorage');
  }

  // Toggle hook
  window.toggleDevMode = () => {
    const nowEnabled = !isDevMode();
    nowEnabled ? enableDevMode() : disableDevMode();
    console.info(`[SEQUENZIA] Dev mode ${nowEnabled ? 'enabled' : 'disabled'}`);

    if (nowEnabled) {
      exposeDevTools();
    } else {
      delete window.DEVTOOLS;
    }
  };

  // First-time exposure
  if (isDevMode()) exposeDevTools();
}

function exposeDevTools(): void {
  window.DEVTOOLS = getAllDevTools();
}
