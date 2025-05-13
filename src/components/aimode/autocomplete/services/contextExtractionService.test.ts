// src/components/aimode/autocomplete/services/contextExtractionService.test.ts

// npm run test -- src/components/aimode/autocomplete/services/contextExtractionService.test.ts

import { describe, it, expect } from 'vitest';
import { extractContext, type ExtractedContext } from './contextExtractionService';
import { remiEncode } from '@/shared/utils/musical/remi/remiUtils.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';
import type  { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

// === Mock Sequencer Factory ===
const mockSequencer = (id: number, notes: Note[]) => ({
  id,
  get notes() {
    return notes;
  }
});

describe('contextExtractionService', () => {
  it('should extract context from primary and other sequencers correctly', () => {
    const remiSettings: RemiEncodeOptions = {
      beatsPerBar: 4,
      stepsPerBeat: 4,
      quantizeDurations: true,
      ignoreVelocity: true
    };

    const primaryNotes: Note[] = [
      { pitch: 'C4', start: 2, duration: 1, velocity: 80 }, // inside range
      { pitch: 'E4', start: 5, duration: 1, velocity: 90 }, // inside range
      { pitch: 'G4', start: 9, duration: 1, velocity: 100 } // outside range
    ];

    const otherNotes1: Note[] = [
      { pitch: 'A3', start: 1, duration: 1, velocity: 70 }, // outside range
      { pitch: 'B3', start: 4, duration: 1, velocity: 75 }, // inside range
      { pitch: 'C4', start: 6, duration: 1, velocity: 80 }  // inside range
    ];

    const otherNotes2: Note[] = [
      { pitch: 'F3', start: 3, duration: 1, velocity: 65 }, // inside range
      { pitch: 'G3', start: 7, duration: 1, velocity: 85 }, // inside range
      { pitch: 'A3', start: 8, duration: 1, velocity: 95 }  // outside range
    ];

    const sequencers = [
      mockSequencer(1, primaryNotes),
      mockSequencer(2, otherNotes1),
      mockSequencer(3, otherNotes2)
    ];

    const startBeat = 4;
    const endBeat = 8;

    // === Re-implement extractContext inline with mocked remiSettings ===
    const isNoteInRange = (note: Note) => note.start >= startBeat && note.start < endBeat;

    const primaryTrackRemi = remiEncode(primaryNotes.filter(isNoteInRange), remiSettings);

    const otherTracksRemi = [
      remiEncode(otherNotes1.filter(isNoteInRange), remiSettings),
      remiEncode(otherNotes2.filter(isNoteInRange), remiSettings)
    ];

    const expectedContext: ExtractedContext = {
      primaryTrackRemi,
      otherTracksRemi,
      startBeat,
      endBeat
    };

    // === Call actual function (with mocked remiSettings through dependency) ===
    const context = extractContext(1, sequencers as any, startBeat, endBeat, remiSettings);

    expect(context).toEqual(expectedContext);
  });

  describe('contextExtractionService (with velocity tokens)', () => {
    it('should include Velocity tokens when ignoreVelocity is false', () => {
      const remiSettings: RemiEncodeOptions = {
        beatsPerBar: 4,
        stepsPerBeat: 4,
        quantizeDurations: true,
        ignoreVelocity: false  // Explicitly include velocities
      };

      const primaryNotes: Note[] = [
        { pitch: 'E4', start: 5, duration: 1, velocity: 90 }
      ];

      const otherNotes1: Note[] = [
        { pitch: 'B3', start: 4, duration: 1, velocity: 75 },
        { pitch: 'C4', start: 6, duration: 1, velocity: 80 }
      ];

      const otherNotes2: Note[] = [
        { pitch: 'G3', start: 7, duration: 1, velocity: 85 }
      ];

      const sequencers = [
        { id: 1, get notes() { return primaryNotes; } },
        { id: 2, get notes() { return otherNotes1; } },
        { id: 3, get notes() { return otherNotes2; } }
      ];

      const startBeat = 4;
      const endBeat = 8;

      // Expected explicit REMI tokens:
      const expectedPrimaryTrackRemi: RemiEvent[] = [
        { type: 'Bar', value: 1 },
        { type: 'Position', value: 4 },
        { type: 'Pitch', value: 'E4' },
        { type: 'Duration', value: 4 },
        { type: 'Velocity', value: 90 }
      ];

      const expectedOtherTracksRemi: RemiEvent[][] = [
        [
          { type: 'Bar', value: 1 },
          { type: 'Position', value: 0 },
          { type: 'Pitch', value: 'B3' },
          { type: 'Duration', value: 4 },
          { type: 'Velocity', value: 75 },

          { type: 'Position', value: 8 },
          { type: 'Pitch', value: 'C4' },
          { type: 'Duration', value: 4 },
          { type: 'Velocity', value: 80 }
        ],
        [
          { type: 'Bar', value: 1 },
          { type: 'Position', value: 12 },
          { type: 'Pitch', value: 'G3' },
          { type: 'Duration', value: 4 },
          { type: 'Velocity', value: 85 }
        ]
      ];

      // === Actual extraction ===
      const context = extractContext(1, sequencers as any, startBeat, endBeat, remiSettings);

      expect(context.primaryTrackRemi).toEqual(expectedPrimaryTrackRemi);
      expect(context.otherTracksRemi).toEqual(expectedOtherTracksRemi);
      expect(context.startBeat).toBe(startBeat);
      expect(context.endBeat).toBe(endBeat);
    });
  });

});
