import { describe, it, expect } from 'vitest';
import { remiEncode, remiDecode } from './remiUtils';
import type { Note } from '../../../interfaces/Note.js';
import type { RemiEvent } from '../../../interfaces/RemiEvent.js';

describe('remiUtils', () => {
  describe('remiEncode / remiDecode (positive cases)', () => {
    it('should encode and decode a single note correctly', () => {
      const notes: Note[] = [{ pitch: 'C4', start: 0, duration: 1, velocity: 90 }];
      const tokens = remiEncode(notes);
      const decoded = remiDecode(tokens);

      expect(decoded).toHaveLength(1);
      expect(decoded[0]).toEqual(notes[0]);
    });

    it('should handle multiple notes within the same bar', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 1, velocity: 90 },
        { pitch: 'E4', start: 1, duration: 1, velocity: 91 },
        { pitch: 'G4', start: 2, duration: 1, velocity: 92 }
      ];
      const tokens = remiEncode(notes);
      const decoded = remiDecode(tokens);

      expect(decoded).toHaveLength(3);
      expect(decoded).toEqual(notes);
    });

    it('should emit Bar tokens and decode correctly across multiple bars', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 1, velocity: 90 },
        { pitch: 'C4', start: 4, duration: 1, velocity: 91 },
        { pitch: 'C4', start: 8, duration: 1, velocity: 92 }
      ];
      const tokens = remiEncode(notes, { beatsPerBar: 4 });
      const decoded = remiDecode(tokens, { beatsPerBar: 4 });

      expect(decoded).toHaveLength(3);
      expect(decoded).toEqual(notes);
    });

    it('should default velocity to 100 when missing', () => {
      const notes: Note[] = [
        { pitch: 'D4', start: 0, duration: 1 },
        { pitch: 'E4', start: 1, duration: 1, velocity: 90 }
      ];
      const tokens = remiEncode(notes);
      const decoded = remiDecode(tokens);

      expect(decoded).toHaveLength(2);
      expect(decoded[0].velocity).toBe(100);
      expect(decoded[1].velocity).toBe(90);
    });

    it('should apply quantized duration correctly when enabled', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 0.75, velocity: 88 }
      ];
      const tokens = remiEncode(notes, {
        quantizeDurations: true,
        stepsPerBeat: 4
      });
      const decoded = remiDecode(tokens, {
        stepsPerBeat: 4,
        quantizeDurations: true
      });      

      // Original duration was 0.75, rounded to 3 steps, decoded as 3 / 4 = 0.75
      expect(decoded[0].duration).toBeCloseTo(0.75);
      expect(decoded[0].start).toBeCloseTo(0);
      expect(decoded[0].pitch).toBe('C4');
    });

    it('should encode/decode non-integer start positions correctly', () => {
      const notes: Note[] = [
        { pitch: 'G4', start: 1.25, duration: 0.5, velocity: 85 }
      ];
      const tokens = remiEncode(notes, { stepsPerBeat: 4 });
      const decoded = remiDecode(tokens, { stepsPerBeat: 4 });

      expect(decoded[0].start).toBeCloseTo(1.25);
      expect(decoded[0].duration).toBeCloseTo(0.5);
    });

    it('should respect custom beatsPerBar and stepsPerBeat', () => {
      const notes: Note[] = [
        { pitch: 'F4', start: 0, duration: 1, velocity: 100 },
        { pitch: 'F4', start: 3, duration: 1, velocity: 100 }, // bar 1 if beatsPerBar = 3
        { pitch: 'F4', start: 6.5, duration: 0.5, velocity: 100 } // bar 2
      ];

      const tokens = remiEncode(notes, {
        beatsPerBar: 3,
        stepsPerBeat: 6
      });

      const decoded = remiDecode(tokens, {
        beatsPerBar: 3,
        stepsPerBeat: 6
      });

      expect(decoded).toHaveLength(3);
      expect(decoded[2].start).toBeCloseTo(6.5);
    });

    it('should perform accurate roundtrip for complex rhythmic patterns', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 0.5, velocity: 100 },
        { pitch: 'E4', start: 1.25, duration: 0.75, velocity: 90 },
        { pitch: 'G4', start: 2.75, duration: 0.25, velocity: 80 },
        { pitch: 'B4', start: 4.0, duration: 2.0, velocity: 110 }
      ];

      const tokens = remiEncode(notes, {
        stepsPerBeat: 4,
        quantizeDurations: true
      });

      const decoded = remiDecode(tokens, {
        stepsPerBeat: 4,
        quantizeDurations: true
      });      

      expect(decoded).toHaveLength(4);
      for (let i = 0; i < notes.length; i++) {
        expect(decoded[i].pitch).toBe(notes[i].pitch);
        expect(decoded[i].velocity).toBe(notes[i].velocity ?? 100);
        expect(decoded[i].start).toBeCloseTo(notes[i].start, 5);
        expect(decoded[i].duration).toBeCloseTo(
          Math.max(1, Math.round(notes[i].duration * 4)) / 4,
          5
        );
      }
    });
  });

  describe('remiDecode / remiEncode (edge and negative cases)', () => {
    it('should skip malformed tokens missing Duration or Velocity after Pitch', () => {
      const tokens = [
        { type: 'Bar', value: 0 },
        { type: 'Position', value: 0 },
        { type: 'Pitch', value: 'C4' }, // Duration and Velocity missing
      ] as unknown as RemiEvent[];
  
      const decoded = remiDecode(tokens);
      expect(decoded).toHaveLength(0); // no notes decoded
    });
  
    it('should skip unknown token types silently', () => {
      const tokens = [
        { type: 'Bar', value: 0 },
        { type: 'Position', value: 0 },
        { type: 'Foo' as any, value: 'junk' }, // invalid type
        { type: 'Pitch', value: 'C4' },
        { type: 'Duration', value: 4 },
        { type: 'Velocity', value: 90 }
      ] as unknown as RemiEvent[];
  
      const decoded = remiDecode(tokens);
      expect(decoded).toHaveLength(1);
      expect(decoded[0].pitch).toBe('C4');
    });
  
    it('should skip notes with invalid duration or velocity values', () => {
      const tokens = [
        { type: 'Bar', value: 0 },
        { type: 'Position', value: 0 },
        { type: 'Pitch', value: 'C4' },
        { type: 'Duration', value: NaN },
        { type: 'Velocity', value: 90 },
  
        { type: 'Position', value: 4 },
        { type: 'Pitch', value: 'D4' },
        { type: 'Duration', value: 4 },
        { type: 'Velocity', value: 'loud' as any }
      ] as unknown as RemiEvent[];
  
      const decoded = remiDecode(tokens);
      expect(decoded).toHaveLength(0); // both malformed
    });
  
    it('should skip malformed out-of-order tokens', () => {
      const tokens = [
        { type: 'Duration', value: 4 },
        { type: 'Velocity', value: 100 },
        { type: 'Pitch', value: 'C4' }, // no preceding Position
      ] as unknown as RemiEvent[];
  
      const decoded = remiDecode(tokens);
      expect(decoded).toHaveLength(0);
    });
  
    it('should decode empty input to an empty note list', () => {
      const decoded = remiDecode([]);
      const encoded = remiEncode([]);
      expect(decoded).toEqual([]);
      expect(encoded).toEqual([]);
    });
  
    it('should handle multiple notes at same position correctly', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 1, velocity: 90 },
        { pitch: 'E4', start: 0, duration: 1, velocity: 91 },
        { pitch: 'G4', start: 0, duration: 1, velocity: 92 }
      ];
  
      const tokens = remiEncode(notes);
      const decoded = remiDecode(tokens);
  
      expect(decoded).toHaveLength(3);
      expect(decoded.map(n => n.pitch).sort()).toEqual(['C4', 'E4', 'G4']);
    });
  
    it('should encode and decode extremely long duration notes without breaking', () => {
      const notes: Note[] = [
        { pitch: 'C4', start: 0, duration: 64, velocity: 90 } // 16 bars long
      ];
  
      const tokens = remiEncode(notes);
      const decoded = remiDecode(tokens);
  
      expect(decoded).toHaveLength(1);
      expect(decoded[0].duration).toBeCloseTo(64);
    });
  });
  
});
