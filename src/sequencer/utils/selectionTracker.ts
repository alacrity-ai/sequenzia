// src/sequencer/utils/getActiveSelection.js

import { getSequencers } from '../factories/SequencerFactory.js';

import type { Note } from '../../shared/interfaces/Note.js';
import type { Grid } from '../matrix/Grid.js';

/**
 * Scans all sequencers and returns the first one with an active note selection.
 * Useful for tools like velocity menus or clipboard actions.
 */
export function getActiveSelection(): { sequencerId: number, selectedNotes: Note[] } | null {
  const sequencers = getSequencers();

  for (const seq of sequencers) {
    const matrix: Grid | undefined = seq.matrix;
    if (!matrix) continue;

    const store = matrix.getInteractionStore();
    if (store.hasSelection()) {
      return {
        sequencerId: seq.id,
        selectedNotes: store.getSelectedNotes()
      };
    }
  }
  return null;
}
