// src/shared/dev/devTools.ts

import { getAllDevTools } from '@/shared/dev/tools/index.js';

const STORAGE_KEY = 'SEQUENZIA_DEV';

declare global {
  interface Window {
    toggleDevMode?: () => void;
    DEVTOOLS?: Record<string, unknown>;
  }
}

export async function registerDevTools(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Lazy load devMode bindings to avoid TDZ/circular binding issues
  const { isDevMode, enableDevMode, disableDevMode } = await import('@/shared/state/devMode.js');

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

  if (isDevMode()) exposeDevTools();
}

function exposeDevTools(): void {
  window.DEVTOOLS = getAllDevTools();
}
