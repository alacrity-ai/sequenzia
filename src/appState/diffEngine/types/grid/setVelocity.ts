// src/appState/diffEngine/types/grid/setVelocity.ts

import { setLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { AppState } from '@/appState/interfaces/AppState.js';
import { Diff } from '@/appState/interfaces/Diff.js';
import { Note } from '@/shared/interfaces/Note.js';

/**
 * Applies a SET_NOTE_VELOCITY diff, updating the velocity of specific notes.
 */
export function applySET_NOTE_VELOCITY(state: AppState, diff: Diff): AppState {
  const newState = structuredClone(state);
  const seq = newState.sequencers.find(s => s.id === diff.sequencerId);
  if (!seq) return state;

  const updated = diff.notes as Note[];

  for (const updatedNote of updated) {
    const match = seq.notes.find(n =>
      n.pitch === updatedNote.pitch &&
      n.start === updatedNote.start &&
      n.duration === updatedNote.duration
    );
    if (match) {
      match.velocity = updatedNote.velocity;
    }
  }

  setLastActiveSequencerId(diff.sequencerId);
  
  return newState;
}

/**
 * Creates a forward diff that updates the velocity of given notes.
 */
export function createUpdateNoteVelocityDiff(sequencerId: number, notes: Note[]): Diff {
  return {
    type: 'SET_NOTE_VELOCITY',
    sequencerId,
    notes: structuredClone(notes),
  };
}

/**
 * Creates a reverse diff by preserving the prior state of the same notes.
 */
export function createReverseNoteVelocityDiff(sequencerId: number, originalNotes: Note[]): Diff {
  return {
    type: 'SET_NOTE_VELOCITY',
    sequencerId,
    notes: structuredClone(originalNotes), // stores the old velocities
  };
}

