// src/components/aimode/autocomplete/helpers/rejectAutoCompleteNotes.ts

import { clearAIPreviewNotes } from '@/components/aimode/autocomplete/stores/autoCompleteStore';
import { getLastActiveSequencerId, getSequencers } from '@/components/sequencer/stores/sequencerStore';
import { runAIAutoComplete, getStartBeatAndEndBeat } from './runAIAutoComplete';

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
  await runAIAutoComplete(lastActiveSequencerId, getSequencers(), startBeat, endBeat);
}
