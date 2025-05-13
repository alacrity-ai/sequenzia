import { getSequencerById } from '@/components/sequencer/stores/sequencerStore.js';
import { recordDiff } from '@/appState/appState.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '@/appState/diffEngine/types/grid/placeNotes.js';
import { clearAIPreviewNotes, getAIPreviewNotes } from '@/components/aimode/autocomplete/stores/autoCompleteStore.js';

/**
 * Applies a list of notes to a sequencer via the diff engine.
 *
 * @param sequencerId - ID of the sequencer to apply notes to.
 */
export function applyAutoCompleteNotes(sequencerId: number): void {
  const notes = getAIPreviewNotes();

  recordDiff(
    createPlaceNotesDiff(sequencerId, notes),
    createReversePlaceNotesDiff(sequencerId, notes)
  );

  clearAIPreviewNotes();

  const sequencer = getSequencerById(sequencerId);
  if (sequencer) {
    // Stop flashing note animation
    sequencer.matrix?.stopAIAutocompleteAnimationLoop();

    // Play Note acceptance animation
    sequencer.matrix?.playNoteAcceptanceAnimation(notes);
  } else {
    console.warn(`Could not stop AI animation: sequencer ${sequencerId} not found.`);
  }
}
