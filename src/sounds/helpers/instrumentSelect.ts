// src/sounds/helpers/instrumentSelect.ts

import { getSequencerById } from '@/components/sequencer/stores/sequencerStore.js';
import { recordDiff } from '@/appState/appState.js';
import { createSetInstrumentDiff, createReverseSetInstrumentDiff } from '@/appState/diffEngine/types/sequencer/setInstrument.js';
import { setGlobalActiveInstrument } from '@/sounds/instrument-player.js';
import { setKeyboardInstrument } from '@/components/topControls/components/keyboard/services/keyboardService.js';

export async function confirmInstrumentSelection(instrumentFullname: string, sequencerId?: number | null): Promise<void> {
  if (sequencerId != null) {
    // If a sequencer ID is specified, apply the change to that sequencer
    const seq = getSequencerById(sequencerId);
    if (seq) {
      recordDiff(
        createSetInstrumentDiff(seq.id, instrumentFullname),
        createReverseSetInstrumentDiff(seq.id, seq.instrumentName)
      );
      seq.setInstrument(instrumentFullname);
    } else {
      console.warn(`Failed to find sequencer with ID ${sequencerId}`);
    }
  } else {
    try {
      // If no sequencer ID is specified, apply the change to the global virtual piano
      await setGlobalActiveInstrument(instrumentFullname);
      setKeyboardInstrument(instrumentFullname);
      window.dispatchEvent(new CustomEvent('global-instrument-selected', {
        detail: { fullName: instrumentFullname }
      }));
    } catch (err) {
      console.error('Failed to load global instrument:', instrumentFullname, err);
    }
  }
}