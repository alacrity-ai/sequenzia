// src/sequencer/matrix/notes/NoteManager.test.ts

// npm run test -- src/components/sequencer/matrix/notes/NoteManager.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoteManager } from './NoteManager';
import type { Note } from '@/shared/interfaces/Note';
import type { InteractionStore } from '../input/stores/InteractionStore';
import type { GridConfig } from '../interfaces/GridConfigTypes';

const mockPlayNote = vi.fn();

vi.mock('@/components/globalControls/ui/sections/GlobalMiniContour', () => ({
  createGlobalMiniContour: vi.fn(),
}));

vi.mock('@/components/globalControls/GlobalControlsController', () => ({
  GlobalControlsController: vi.fn().mockImplementation(() => ({
    getGlobalMiniContourCanvas: vi.fn().mockReturnValue(document.createElement('canvas')),
  })),
}));

vi.mock('@/main', () => ({}));

vi.mock('../../transport', () => ({}));
  
vi.mock('../../ui/controls/instrumentSelector', () => ({
    setupInstrumentSelector: vi.fn(),
  }));

vi.mock('../../../playhead/global-playhead', () => ({
    initGlobalPlayhead: vi.fn(),
    updateGlobalPlayhead: vi.fn(),
    clearGlobalPlayhead: vi.fn(),
  }));

vi.mock('../../../playhead/global-playhead-interaction', () => ({
    initGlobalPlayheadInteraction: vi.fn(),
    destroyGlobalPlayheadInteraction: vi.fn(),
  }));

vi.mock('../../factories/SequencerFactory', () => {
  return {
    getSequencers: () => [],
    registerSequencer: vi.fn(),
    unregisterSequencer: vi.fn(),
    sequencers: [],
    createSequencer: vi.fn(() => ({
      seq: {},         // return mock shape of a Sequencer
      wrapper: {}      // return mock shape of a wrapper if needed
    }))
  };
});

vi.mock('../../../shared/playback/transportService', () => ({
  getTempo: () => 120,
  updateTempo: vi.fn(),
  updateTotalMeasures: vi.fn(),
  updateTimeSignature: vi.fn(),
  setLoopEnabled: vi.fn(),
}));


const config: GridConfig = {
  totalMeasures: 16,
  beatsPerMeasure: 4,

  layout: {
    labelWidthColumns: 1,
    headerHeightRows: 2,
    footerHeightRows: 1,
    labelWidth: 80,
    headerHeight: 40,
    footerHeight: 40,
    baseCellWidth: 70,
    minCellWidth: 10,
    maxCellWidth: 200,
    verticalCellRatio: 4,
    highestMidi: 108,
    lowestMidi: 21,
  },

  display: {
    showMeasureLines: true,
    showBeatLines: true,
    showHoveredCell: true,
    highlightCurrentMeasure: true,
  },

  behavior: {
    zoom: 1.0,
    scrollMargin: 48,
    enableSnapping: true,
    snapDivisions: 4,
    maxZoom: 1.6,
    minZoom: 0.5,
  },
};


const noteA: Note = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
const noteB: Note = { pitch: 'E4', start: 1, duration: 1, velocity: 100 };
const noteC: Note = { pitch: 'G4', start: 2, duration: 1, velocity: 100 };

describe('NoteManager - Core Note Manipulation', () => {
  let manager: NoteManager;

  beforeEach(() => {
    manager = new NoteManager(config, mockPlayNote);
  });

  it('set() and getAll() should store and retrieve notes', () => {
    manager.set([noteA, noteB]);
    expect(manager.getAll()).toEqual([noteA, noteB]);
  });

  it('add() should append a note', () => {
    manager.set([noteA]);
    manager.add(noteB);
    expect(manager.getAll()).toEqual([noteA, noteB]);
  });

  it('remove() should delete a single note by pitch and start', () => {
    manager.set([noteA, noteB, noteC]);
    manager.rebuildIndex();
    manager.remove(noteB);
    expect(manager.getAll()).toEqual([noteA, noteC]);
  });

  it('removeAll() should delete a group of notes', () => {
    manager.set([noteA, noteB, noteC]);
    manager.rebuildIndex();
    manager.removeAll([noteA, noteC]);
    expect(manager.getAll()).toEqual([noteB]);
  });

  it('rebuildIndex() creates lookup indices for efficient access', () => {
    manager.set([noteA, noteB, noteC]);
    manager.rebuildIndex();

    expect(manager.findAtPosition('C4', 0)).toEqual(noteA);
    expect(manager.findAtPosition('E4', 1)).toEqual(noteB);
    expect(manager.findAtPosition('G4', 2)).toEqual(noteC);
    expect(manager.findAtPosition('C5', 0)).toBeUndefined();
  });

  it('getTrackedNotes() maps internal notes with interaction state', () => {
    manager.set([noteA, noteB]);
    const mockStore: Partial<InteractionStore> = {
      getHoveredNoteKey: () => 'C4:0',
      getSelectedNotes: () => [noteB],
      isNoteHighlighted: (n: Note) => n.pitch === 'E4',
    };

    const tracked = manager.getTrackedNotes(mockStore as InteractionStore);
    expect(tracked).toEqual([
      {
        note: noteA,
        state: {
          hovered: true,
          selected: false,
          highlighted: false,
        },
      },
      {
        note: noteB,
        state: {
          hovered: false,
          selected: true,
          highlighted: true,
        },
      },
    ]);
  });

  describe('NoteManager - Indexing and Selection Utilities', () => {
    let manager: NoteManager;
  
    const noteA: Note = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    const noteB: Note = { pitch: 'C4', start: 1, duration: 1, velocity: 100 };
    const noteC: Note = { pitch: 'E4', start: 0, duration: 1, velocity: 100 };
  
    beforeEach(() => {
      manager = new NoteManager(config, vi.fn());
    });
  
    it('rebuildIndex() constructs noteIndex and pitchIndex with sorted entries', () => {
      manager.set([noteC, noteB, noteA]); // Out of order on purpose
      manager.rebuildIndex();
  
      // Check noteIndex
      expect(manager.findAtPosition('C4', 0)).toEqual(noteA);
      expect(manager.findAtPosition('C4', 1)).toEqual(noteB);
      expect(manager.findAtPosition('E4', 0)).toEqual(noteC);
      expect(manager.findAtPosition('E4', 1)).toBeUndefined();
  
      // Internally, pitchIndex[C4] should be sorted by start time
      const internalPitchIndex = (manager as any).pitchIndex.get('C4');
      expect(internalPitchIndex.map((n: Note) => n.start)).toEqual([0, 1]);
    });
  
    it('findAtPosition() retrieves notes by pitch and start from noteIndex', () => {
      manager.set([noteA, noteC]);
      manager.rebuildIndex();
  
      expect(manager.findAtPosition('C4', 0)).toEqual(noteA);
      expect(manager.findAtPosition('E4', 0)).toEqual(noteC);
      expect(manager.findAtPosition('C4', 1)).toBeUndefined();
    });
  
    it('mergeSelections() combines arrays without duplicating same pitch/start', () => {
      const duplicateA = { ...noteA }; // different object, same pitch/start
      const result = manager.mergeSelections([noteA, noteC], [duplicateA, noteB]);
  
      expect(result).toHaveLength(3);
      expect(result).toContainEqual(noteA);
      expect(result).toContainEqual(noteB);
      expect(result).toContainEqual(noteC);
  
      // Ensure no duplicates
      const keys = result.map(n => `${n.pitch}:${n.start}`);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);
    });
  });

  describe('NoteManager - Indexing and Merging Edge Cases', () => {
    let manager: NoteManager;
  
    const noteA: Note = { pitch: 'C4', start: 0, duration: 1, velocity: 100 };
    const noteB: Note = { pitch: 'C4', start: 1, duration: 1, velocity: 90 };
    const noteC: Note = { pitch: 'E4', start: 2, duration: 1, velocity: 80 };
  
    beforeEach(() => {
      manager = new NoteManager(config, vi.fn());
    });
  
    it('rebuildIndex() handles empty note list gracefully', () => {
      manager.set([]);
      manager.rebuildIndex();
      expect(manager.findAtPosition('C4', 0)).toBeUndefined();
      expect((manager as any).pitchIndex.size).toBe(0);
      expect((manager as any).noteIndex.size).toBe(0);
    });
  
    it('rebuildIndex() overwrites existing indices cleanly', () => {
      manager.set([noteA]);
      manager.rebuildIndex();
      expect(manager.findAtPosition('C4', 0)).toEqual(noteA);
  
      manager.set([noteB, noteC]); // Replaces contents
      manager.rebuildIndex();
      expect(manager.findAtPosition('C4', 0)).toBeUndefined();
      expect(manager.findAtPosition('C4', 1)).toEqual(noteB);
      expect(manager.findAtPosition('E4', 2)).toEqual(noteC);
    });
  
    it('mergeSelections() tolerates empty arrays', () => {
      const result1 = manager.mergeSelections([], []);
      expect(result1).toEqual([]);
  
      const result2 = manager.mergeSelections([noteA], []);
      expect(result2).toEqual([noteA]);
  
      const result3 = manager.mergeSelections([], [noteB]);
      expect(result3).toEqual([noteB]);
    });
  
    it('mergeSelections() treats notes with same pitch/start but different velocity as duplicates', () => {
      const modifiedNoteA = { ...noteA, velocity: 20 };
      const result = manager.mergeSelections([noteA], [modifiedNoteA]);
      expect(result.length).toBe(1);
      expect(result[0].start).toBe(0);
      expect(result[0].pitch).toBe('C4');
    });
  
    it('mergeSelections() maintains insertion order of first-seen note', () => {
      const reordered = manager.mergeSelections([noteB, noteA], [noteA]);
      expect(reordered.map(n => `${n.pitch}:${n.start}`)).toEqual([
        'C4:1',
        'C4:0',
      ]);
    });
  
    it('rebuildIndex() roundtrip: can clear and restore and still find notes correctly', () => {
      const notes = [noteA, noteB, noteC];
      manager.set(notes);
      manager.rebuildIndex();
  
      for (const note of notes) {
        const found = manager.findAtPosition(note.pitch, note.start);
        expect(found).toEqual(note);
      }
  
      manager.set([]); // wipe
      manager.rebuildIndex();
      for (const note of notes) {
        expect(manager.findAtPosition(note.pitch, note.start)).toBeUndefined();
      }
  
      manager.set(notes); // restore
      manager.rebuildIndex();
      for (const note of notes) {
        expect(manager.findAtPosition(note.pitch, note.start)).toEqual(note);
      }
    });
  });
  
});
