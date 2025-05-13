// src/appState/diffEngine/types/grid/moveNotes.ts

import { setLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a MOVE_NOTES diff to update the position of notes inside a sequencer.
 */
export function applyMOVE_NOTES(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  const from = diff.from as Note[];
  const to = diff.to as Note[];

  for (let i = 0; i < from.length; i++) {
    const original = from[i];
    const updated = to[i];

    const index = seq.notes.findIndex(
      (n: Note) =>
        n.pitch === original.pitch &&
        n.start === original.start &&
        n.duration === original.duration
    );

    if (index !== -1) {
      seq.notes[index].pitch = updated.pitch;
      seq.notes[index].start = updated.start;
    }
  }

  setLastActiveSequencerId(diff.sequencerId);

  return newState;
}

/**
 * Creates a forward diff to move notes.
 */
export function createMoveNotesDiff(sequencerId: number, from: Note[], to: Note[]): Diff {
  return {
    type: 'MOVE_NOTES',
    sequencerId,
    from: structuredClone(from),
    to: structuredClone(to),
  };
}

/**
 * Creates a reverse diff to move notes back to original position.
 */
export function createReverseMoveNotesDiff(sequencerId: number, from: Note[], to: Note[]): Diff {
  return createMoveNotesDiff(sequencerId, to, from);
}
