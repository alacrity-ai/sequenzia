// src/components/sequencer/ui/setupAddTrackButton.ts

import { recordDiff } from '@/appState/appState.js';
import { sequencers } from '@/components/sequencer/factories/SequencerFactory.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from '@/appState/diffEngine/types/sequencer/createSequencer.js';


export function setupAddTrackButton(): void {
    const addBtn = document.getElementById('add-sequencer') as HTMLElement;

    addBtn.addEventListener('click', () => {
      const newId = sequencers.length;
      const instrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
      recordDiff(
        createCreateSequencerDiff(newId, instrument),
        createReverseCreateSequencerDiff(newId)
      );
    });
  }
  