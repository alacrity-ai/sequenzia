// src/components/aimode/shared/context/extractRemiBeforeAfterContext.test.ts

// npm run test -- src/components/aimode/shared/context/extractRemiBeforeAfterContext.test.ts

import { describe, it, expect } from 'vitest';
import { extractRemiBeforeAfterContext } from '@/components/aimode/shared/context/extractRemiBeforeAfterContext.js';
import type { Note } from '@/shared/interfaces/Note.js';

describe('extractRemiBeforeAfterContext', () => {
  const sampleNotes: Note[] = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'D4', start: 2, duration: 1 },
    { pitch: 'E4', start: 4, duration: 1 },
    { pitch: 'F4', start: 6, duration: 1 },
    { pitch: 'G4', start: 8, duration: 1 }
  ];

  const remiSettings = { beatsPerBar: 4, stepsPerBeat: 4 };

  it('should select notes evenly before and after the target beat', () => {
    const result = extractRemiBeforeAfterContext(sampleNotes, 4, 4, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should prioritize beforeRemi if after notes are scarce', () => {
    const result = extractRemiBeforeAfterContext(sampleNotes, 10, 4, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([]);
  });

  it('should prioritize afterRemi if before notes are scarce', () => {
    const result = extractRemiBeforeAfterContext(sampleNotes, 0, 4, remiSettings);

    expect(result.beforeRemi).toEqual([]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should stop once contextBeats are satisfied', () => {
    const result = extractRemiBeforeAfterContext(sampleNotes, 4, 2, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should handle empty input gracefully', () => {
    const result = extractRemiBeforeAfterContext([], 4, 4, remiSettings);

    expect(result.beforeRemi).toEqual([]);
    expect(result.afterRemi).toEqual([]);
  });
});


describe('extractRemiBeforeAfterContext (complex fallback cases)', () => {
  const extendedNotes: Note[] = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'D4', start: 2, duration: 1 },
    { pitch: 'E4', start: 4, duration: 1 },
    { pitch: 'F4', start: 6, duration: 1 },
    { pitch: 'G4', start: 8, duration: 1 },
    { pitch: 'A4', start: 10, duration: 1 },
    { pitch: 'B4', start: 12, duration: 1 }
  ];

  const remiSettings = { beatsPerBar: 4, stepsPerBeat: 4 };

  it('should prioritize afterRemi if before notes are scarce but available', () => {
    const result = extractRemiBeforeAfterContext(extendedNotes, 2, 5, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should still balance when enough before and after are available', () => {
    const result = extractRemiBeforeAfterContext(extendedNotes, 6, 6, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 2 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });
});


describe('extractRemiBeforeAfterContext (with large beat gap)', () => {
  const gappedNotes: Note[] = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'D4', start: 2, duration: 1 },
    { pitch: 'E4', start: 4, duration: 1 },
    { pitch: 'F4', start: 20, duration: 1 },
    { pitch: 'G4', start: 22, duration: 1 }
  ];

  const remiSettings = { beatsPerBar: 4, stepsPerBeat: 4 };

  it('should correctly prioritize nearby notes and fill distant afterRemi if needed', () => {
    const result = extractRemiBeforeAfterContext(gappedNotes, 4, 4, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should include distant afterRemi only if needed to satisfy contextBeats', () => {
    const result = extractRemiBeforeAfterContext(gappedNotes, 4, 10, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should only include afterRemi if no beforeRemi are available', () => {
    const result = extractRemiBeforeAfterContext(gappedNotes, 0, 4, remiSettings);

    expect(result.beforeRemi).toEqual([]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });

  it('should handle targetBeat in the middle of a large gap without error', () => {
    const result = extractRemiBeforeAfterContext(gappedNotes, 15, 4, remiSettings);

    expect(result.beforeRemi).toEqual([
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);

    expect(result.afterRemi).toEqual([
      { type: 'Bar', value: 5 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 },
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ]);
  });
});
