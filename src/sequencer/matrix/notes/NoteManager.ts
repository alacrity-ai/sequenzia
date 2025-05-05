// src/sequencer/matrix/notes/NoteManager.ts

import type { Note } from '../../interfaces/Note.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { SequencerContext } from '../interfaces/SequencerContext.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';


export class NoteManager {
  private notes: Note[] = [];
  private readonly config: GridConfig;
  private readonly playNote: SequencerContext['playNote'];
  private noteIndex = new Map<string, Note>();
  private pitchIndex: Map<string, Note[]> = new Map();

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

  // Removes a single note
  public remove(note: Note): void {
    const key = `${note.pitch}:${note.start}`;
    this.notes = this.notes.filter(n => !(n.pitch === note.pitch && n.start === note.start));
    this.noteIndex.delete(key);
  }
  
  // Removes all notes in the provided array
  public removeAll(notesToRemove: Note[]): void {
    const keysToRemove = new Set(notesToRemove.map(n => `${n.pitch}:${n.start}`));
    this.notes = this.notes.filter(n => !keysToRemove.has(`${n.pitch}:${n.start}`));
    for (const key of keysToRemove) {
      this.noteIndex.delete(key);
    }
  }  

  public rebuildIndex(): void {
    this.noteIndex.clear();
    this.pitchIndex.clear();
  
    for (const note of this.notes) {
      const key = `${note.pitch}:${note.start}`;
      this.noteIndex.set(key, note);
  
      if (!this.pitchIndex.has(note.pitch)) {
        this.pitchIndex.set(note.pitch, []);
      }
      this.pitchIndex.get(note.pitch)!.push(note);
    }
  
    // Sort each pitch's array by start time to enable binary search
    for (const notes of this.pitchIndex.values()) {
      notes.sort((a, b) => a.start - b.start);
    }
  }
  

  public findAtPosition(pitch: string, start: number): Note | undefined {
    return this.noteIndex.get(`${pitch}:${start}`);
  }

  public findNoteUnderCursor(pitch: string, beat: number): Note | undefined {
    const notes = this.pitchIndex.get(pitch);
    if (!notes || notes.length === 0) return undefined;
  
    // Binary search to find the latest note whose start <= beat
    let lo = 0;
    let hi = notes.length - 1;
    let candidateIdx = -1;
  
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const note = notes[mid];
  
      if (note.start <= beat) {
        candidateIdx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  
    if (candidateIdx === -1) return undefined;
  
    // Check the candidate and possibly a few prior for containment
    for (let i = candidateIdx; i >= 0; i--) {
      const n = notes[i];
      if (beat >= n.start && beat < n.start + n.duration) {
        return n;
      }
      if (n.start + n.duration < beat) break; // exit early if passed
    }
  
    return undefined;
  }

  /**
   * Returns the note under the given pitch/beat if the beat is within its right edge.
   * Useful for detecting resizing intent.
   * @param pitch - Pitch string (e.g., "C4")
   * @param beat - Cursor beat position (not snapped)
   * @param edgeThreshold - Fraction of duration near end to treat as resizable
   */
  public findNoteEdgeAtCursor(
    pitch: string,
    beat: number,
    edgeThreshold: number = 0.25
  ): Note | undefined {
    const notes = this.pitchIndex.get(pitch);
    if (!notes || notes.length === 0) return undefined;

    // Binary search as before
    let lo = 0;
    let hi = notes.length - 1;
    let candidateIdx = -1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const note = notes[mid];

      if (note.start <= beat) {
        candidateIdx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (candidateIdx === -1) return undefined;

    for (let i = candidateIdx; i >= 0; i--) {
      const n = notes[i];
      const edgeStart = n.start + n.duration * (1 - edgeThreshold);
      const edgeEnd = n.start + n.duration;

      if (beat >= edgeStart && beat <= edgeEnd) {
        return n;
      }
      if (n.start + n.duration < beat) break;
    }

    return undefined;
  }

  /** Optionally use this in interactions to preview a note */
  public previewNote(pitch: string, duration: number, velocity = 100, loop = false): void {
    void this.playNote(pitch, duration, velocity, loop);
  }
}
