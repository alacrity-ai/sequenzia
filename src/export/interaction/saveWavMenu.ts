// src/export/interaction/saveWavMenu.ts

import { getAppState } from '@/appState/appState.js';
import { exportSessionToWAV } from '@/export/save.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';

export interface SaveWavOptions {
  sampleRate: number;
  includePan: boolean;
}

export function showSaveWavOptionsModal(): void {
  const modal = document.getElementById('save-wav-options-modal')!;
  modal.classList.remove('hidden');
}

function hideModal(): void {
  const modal = document.getElementById('save-wav-options-modal')!;
  modal.classList.add('hidden');
}

export async function applySaveWavOptions(): Promise<void> {
  const sampleRate = parseInt(
    (document.getElementById('save-wav-sample-rate') as HTMLSelectElement).value,
    10
  );

  const includePan = (document.getElementById('save-wav-include-pan') as HTMLInputElement)?.checked ?? true;

  hideModal();

  // Fetch current state and sequencers
  const appState = getAppState(); // assumes global session state
  const sequencers = getSequencers();

  const session = {
    globalConfig: {
      bpm: appState.tempo,
      beatsPerMeasure: appState.timeSignature[0],
      totalMeasures: appState.totalMeasures,
      songKey: appState.songKey
    },
    tracks: sequencers.map(seq => ({
      notes: seq.notes,
      instrument: seq.instrumentName,
      config: seq.config,
      volume: seq.volume,
      pan: seq.pan,
    }))
  };

  try {
    await exportSessionToWAV(session, { sampleRate, includePan });
  } catch (err) {
    console.error('[SaveWav] Export failed:', err);
  }
}

export function cancelSaveWavOptions(): void {
  hideModal();
}
