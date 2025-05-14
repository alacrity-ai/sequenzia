// src/components/aimode/features/autocomplete/helpers/rejectAutoCompleteNotes.ts

import { clearAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getLastActiveSequencerId, getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { runRemiContinuationPipeline } from './runAIAutoComplete.js';
import { getStartBeatAndEndBeat } from '@/components/aimode/shared/helpers/contextHelpers.js';

/**
 * Rejects the current AI autocomplete notes and triggers a new generation.
 */
export async function rejectAutoCompleteNotes(): Promise<void> {
  // Clear the current preview notes
  clearAIPreviewNotes();

  const lastActiveSequencerId = getLastActiveSequencerId();
  if (lastActiveSequencerId === null) {
    console.warn('No active sequencer to re-run autocomplete for.');
    return;
  }

  const sequencer = getSequencers().find(seq => seq.id === lastActiveSequencerId);
  if (!sequencer) {
    console.error(`Sequencer with id ${lastActiveSequencerId} not found.`);
    return;
  }

  const [startBeat, endBeat] = getStartBeatAndEndBeat(sequencer);

  console.log(`Rejecting current autocomplete and re-running for beats ${startBeat} to ${endBeat} on sequencer ${lastActiveSequencerId}`);
  await runRemiContinuationPipeline(lastActiveSequencerId, getSequencers(), startBeat, endBeat);
}
