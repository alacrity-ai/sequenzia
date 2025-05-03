// src/sequencer/matrix/notes/NoteManager.ts

import type { Note } from '../../interfaces/Note.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';

export class NoteManager {
  private notes: Note[] = [];

  public set(notes: Note[]): void {
    this.notes = notes;
  }

  public getAll(): Note[] {
    return this.notes;
  }

  public add(note: Note): void {
    this.notes.push(note);
  }

  public getTrackedNotes(store: InteractionStore): TrackedNote[] {
    return this.notes.map(n => ({
      note: n,
      state: {
        hovered: false,
        selected: false,
        highlighted: false
      }
    }));
  }
}
