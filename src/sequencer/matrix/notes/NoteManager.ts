// src/sequencer/matrix/notes/NoteManager.ts

import type { Note } from '../../interfaces/Note.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { SequencerContext } from '../interfaces/SequencerContext.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

import { rowToNote } from '../utils/noteUtils.js';
import { config } from 'process';


export class NoteManager {
  private notes: Note[] = [];
  private readonly config: GridConfig;
  private readonly playNote: SequencerContext['playNote'];
  private noteIndex = new Map<string, Note>();

  constructor(config: GridConfig, playNote: SequencerContext['playNote']) {
    this.config = config;
    this.playNote = playNote;
  }

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
    const hoveredKey = store.getHoveredNoteKey();
    const highlighted = (note: Note) => store.isNoteHighlighted(note);
    const selectedKeys = new Set(
      store.getSelectedNotes().map(n => `${n.pitch}:${n.start}`)
    );
  
    return this.notes.map(note => {
      const key = `${note.pitch}:${note.start}`;
  
      return {
        note,
        state: {
          hovered: key === hoveredKey,
          selected: selectedKeys.has(key),
          highlighted: highlighted(note)
        }
      };
    });
  }
  
  public rebuildIndex(): void {
    this.noteIndex.clear();
    for (const note of this.notes) {
      const key = `${note.pitch}:${note.start}`;
      this.noteIndex.set(key, note);
    }
  }

  public findAtPosition(pitch: string, start: number): Note | undefined {
    return this.noteIndex.get(`${pitch}:${start}`);
  }

  /** Optionally use this in interactions to preview a note */
  public previewNote(pitch: string, duration: number, velocity = 100, loop = false): void {
    void this.playNote(pitch, duration, velocity, loop);
  }
}
