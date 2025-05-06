import { describe, it, expect } from 'vitest';
import { mergeRemiContinuation } from './mergeRemiContinuation';
import type { Note } from '../../../interfaces/Note';
import type { RemiEvent } from '../../../interfaces/RemiEvent';

describe('mergeRemiContinuation', () => {
  it('should correctly merge a simple continuation after the original melody', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 90 },
      { pitch: 'E4', start: 1, duration: 1, velocity: 90 },
      { pitch: 'G4', start: 2, duration: 1, velocity: 90 }
    ];

    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 0 },
      { type: 'Pitch', value: 'A4' },
      { type: 'Duration', value: 4 }, // 1 beat if stepsPerBeat = 4
      { type: 'Velocity', value: 100 }
    ];

    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });

    expect(merged).toHaveLength(4);

    const [n0, n1, n2, n3] = merged;
    expect(n3.pitch).toBe('A4');
    expect(n3.start).toBeCloseTo(4);
    expect(n3.duration).toBeCloseTo(1);
    expect(n3.velocity).toBe(100);
  });

  it('should apply no offset if continuation already starts after original ends', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 90 }
    ];

    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 1 },
      { type: 'Position', value: 8 }, // beat 2
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 95 }
    ];

    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });

    expect(merged).toHaveLength(2);
    const [_, n1] = merged;
    // Bar 1, Position 8, stepsPerBeat = 4 → beat 4 + (8 / 4) = 6
    expect(n1.start).toBeCloseTo(6);
  });

  it('should return just original if continuation is empty', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 90 }
    ];

    const merged = mergeRemiContinuation(original, [], {
      stepsPerBeat: 4,
      quantizeDurations: true
    });

    expect(merged).toEqual(original);
  });

  it('should return just decoded continuation if original is empty', () => {
    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 100 }
    ];

    const merged = mergeRemiContinuation([], continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });

    expect(merged).toHaveLength(1);
    expect(merged[0].pitch).toBe('E4');
    expect(merged[0].start).toBe(1);
  });

  it('should shift continuation forward if it overlaps the tail of original', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 2, velocity: 90 } // ends at beat 2
    ];
  
    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 4 }, // beat 1
      { type: 'Pitch', value: 'G4' },
      { type: 'Duration', value: 4 }, // 1 beat
      { type: 'Velocity', value: 100 }
    ];
  
    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });
  
    expect(merged).toHaveLength(2);
  
    const shifted = merged[1];
    expect(shifted.start).toBeCloseTo(2); // shifted from 1 → 2 (offset = 1)
    expect(shifted.pitch).toBe('G4');
  });

  it('should merge multi-note continuation correctly preserving relative timing', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 80 }
    ];
  
    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 4 },
      { type: 'Pitch', value: 'D4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 85 },
  
      { type: 'Position', value: 8 },
      { type: 'Pitch', value: 'E4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];
  
    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });
  
    expect(merged).toHaveLength(3);
    expect(merged[1].start).toBeCloseTo(1);
    expect(merged[2].start).toBeCloseTo(2);
  });

  it('should not shift continuation if it starts exactly at the original tail', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 3, velocity: 100 } // ends at 3
    ];
  
    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Position', value: 12 }, // beat 3
      { type: 'Pitch', value: 'F4' },
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 105 }
    ];
  
    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });
  
    expect(merged).toHaveLength(2);
    expect(merged[1].start).toBeCloseTo(3); // No offset applied
  });
  
  it('should skip malformed continuation tokens', () => {
    const original: Note[] = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 90 }
    ];
  
    const continuation: RemiEvent[] = [
      { type: 'Bar', value: 0 },
      { type: 'Pitch', value: 'D4' }, // Missing Position + Duration + Velocity
      { type: 'Duration', value: 4 },
      { type: 'Velocity', value: 90 }
    ];
  
    const merged = mergeRemiContinuation(original, continuation, {
      stepsPerBeat: 4,
      quantizeDurations: true
    });
  
    expect(merged).toHaveLength(1); // Only the original remains
  });
  

});
