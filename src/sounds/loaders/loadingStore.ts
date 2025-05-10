// src/sounds/loaders/loadingStore.ts

import { showLoadingModal, hideLoadingModal } from '@/shared/modals/global/loadingModal.js';

let activeLoads = 0;

export function beginInstrumentLoad(): void {
  activeLoads++;
  if (activeLoads === 1) {
    showLoadingModal();
  }
}

export function endInstrumentLoad(): void {
  activeLoads--;
  if (activeLoads <= 0) {
    activeLoads = 0;
    hideLoadingModal();
  }
}

// Optional helper for use with promises
export async function trackInstrumentLoad<T>(promise: Promise<T>): Promise<T> {
  beginInstrumentLoad();
  try {
    return await promise;
  } finally {
    endInstrumentLoad();
  }
}
