// src/components/sequencer/matrix/__mocks__/createMockNoteManager.ts

import type { Note } from '@/shared/interfaces/Note';
import type { NoteManager } from '@/components/sequencer/matrix/notes/NoteManager';
import { vi } from 'vitest';

/**
 * Factory function to create a mock NoteManager instance.
 * Allows controlled simulation of NoteManager behavior for testing.
 */
export function createMockNoteManager(overrides: Partial<NoteManager> = {}): NoteManager {
  const mockNotes: Note[] = [];
  const mockNoteIndex = new Map<string, Note>();
  const mockPitchIndex = new Map<string, Note[]>();

  const mock = {
    set: vi.fn((notes: Note[]) => {
      mockNotes.length = 0;
      mockNotes.push(...notes);
      mockNoteIndex.clear();
      mockPitchIndex.clear();
      notes.forEach(note => {
        const key = `${note.pitch}:${note.start}`;
        mockNoteIndex.set(key, note);

        if (!mockPitchIndex.has(note.pitch)) {
          mockPitchIndex.set(note.pitch, []);
        }
        mockPitchIndex.get(note.pitch)!.push(note);
      });
    }),

    getAll: vi.fn(() => mockNotes),

    add: vi.fn((note: Note) => {
      mockNotes.push(note);
      const key = `${note.pitch}:${note.start}`;
      mockNoteIndex.set(key, note);

      if (!mockPitchIndex.has(note.pitch)) {
        mockPitchIndex.set(note.pitch, []);
      }
      mockPitchIndex.get(note.pitch)!.push(note);
    }),

    remove: vi.fn((note: Note) => {
      const key = `${note.pitch}:${note.start}`;
      const index = mockNotes.findIndex(n => n.pitch === note.pitch && n.start === note.start);
      if (index !== -1) mockNotes.splice(index, 1);
      mockNoteIndex.delete(key);
    }),

    removeAll: vi.fn((notes: Note[]) => {
      const keysToRemove = new Set(notes.map(n => `${n.pitch}:${n.start}`));
      for (let i = mockNotes.length - 1; i >= 0; i--) {
        const n = mockNotes[i];
        if (keysToRemove.has(`${n.pitch}:${n.start}`)) {
          mockNotes.splice(i, 1);
        }
      }
      keysToRemove.forEach(key => mockNoteIndex.delete(key));
    }),

    rebuildIndex: vi.fn(() => {
      mockNoteIndex.clear();
      mockPitchIndex.clear();
      mockNotes.forEach(note => {
        const key = `${note.pitch}:${note.start}`;
        mockNoteIndex.set(key, note);

        if (!mockPitchIndex.has(note.pitch)) {
          mockPitchIndex.set(note.pitch, []);
        }
        mockPitchIndex.get(note.pitch)!.push(note);
      });
    }),

    findAtPosition: vi.fn((pitch: string, start: number) => {
      return mockNoteIndex.get(`${pitch}:${start}`);
    }),

    findNoteUnderCursor: vi.fn((pitch: string, beat: number) => {
      const notes = mockPitchIndex.get(pitch) || [];
      return notes.find(n => beat >= n.start && beat < n.start + n.duration);
    }),

    findNoteEdgeAtCursor: vi.fn((pitch: string, beat: number, edgeThreshold: number = 0.25) => {
      const notes = mockPitchIndex.get(pitch) || [];
      return notes.find(n => {
        const edgeStart = n.start + n.duration * (1 - edgeThreshold);
        const edgeEnd = n.start + n.duration;
        return beat >= edgeStart && beat <= edgeEnd;
      });
    }),

    mergeSelections: vi.fn((a: Note[], b: Note[]) => {
      const seen = new Set<string>();
      const merged: Note[] = [];
      for (const note of [...a, ...b]) {
        const key = `${note.pitch}:${note.start}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(note);
        }
      }
      return merged;
    }),

    previewNote: vi.fn((pitch: string, duration: number, velocity = 100, loop = false) => {
      // No-op stub
    }),

    findNoteAtMousePosition: vi.fn(() => undefined),
    getTrackedNotes: vi.fn(() => [])
  } as unknown as NoteManager;

  // Apply overrides as needed for specialized mocks
  return Object.assign(mock, overrides);
}
