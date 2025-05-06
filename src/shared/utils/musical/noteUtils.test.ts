// src/audio/pitch-utils.test.ts

import { describe, it, expect } from 'vitest';
import {
  pitchToMidi,
  midiToPitch,
  noteToMidi,
  getPitchClass,
  isBlackKey,
} from './noteUtils.js';

describe('pitch-utils', () => {
  describe('pitchToMidi', () => {
    it('should convert pitches with sharps and flats to MIDI correctly', () => {
      expect(pitchToMidi('C4')).toBe(60);
      expect(pitchToMidi('A4')).toBe(69);
      expect(pitchToMidi('G#3')).toBe(56);
      expect(pitchToMidi('Db5')).toBe(73);
      expect(pitchToMidi('Fb4')).toBe(64); // Fb4 == E4
      expect(pitchToMidi('B#3')).toBe(60); // B#3 == C4
    });

    it('should handle double sharps and double flats', () => {
      expect(pitchToMidi('C##4')).toBe(62); // D4
      expect(pitchToMidi('Dbb4')).toBe(60); // C4
      expect(pitchToMidi('F##4')).toBe(67); // G4
      expect(pitchToMidi('Gbb4')).toBe(65); // F4
    });

    it('should return null for invalid pitches', () => {
      expect(pitchToMidi('H4')).toBeNull();
      expect(pitchToMidi('')).toBeNull();
      expect(pitchToMidi(null)).toBeNull();
      expect(pitchToMidi(undefined)).toBeNull();
      expect(pitchToMidi('C#')).toBeNull(); // missing octave
    });
  });

  describe('midiToPitch', () => {
    it('should convert MIDI to pitch names with sharps (default)', () => {
      expect(midiToPitch(60)).toBe('C4');
      expect(midiToPitch(69)).toBe('A4');
      expect(midiToPitch(61)).toBe('C#4');
      expect(midiToPitch(63)).toBe('D#4');
      expect(midiToPitch(58)).toBe('A#3');
    });

    it('should convert MIDI to pitch names preferring flats', () => {
      expect(midiToPitch(61, true)).toBe('Db4');
      expect(midiToPitch(63, true)).toBe('Eb4');
      expect(midiToPitch(70, true)).toBe('Bb4');
      expect(midiToPitch(46, true)).toBe('Bb2');
    });
  });

  describe('noteToMidi', () => {
    it('should parse notes and return MIDI numbers', () => {
      expect(noteToMidi('C4')).toBe(60);
      expect(noteToMidi('D#4')).toBe(63);
      expect(noteToMidi('Bb3')).toBe(58);
    });

    it('should return null for invalid notes', () => {
      expect(noteToMidi('')).toBeNull();
      expect(noteToMidi('R2')).toBeNull();
      expect(noteToMidi(null as unknown as string)).toBeNull();
      expect(noteToMidi(undefined as unknown as string)).toBeNull();
    });
  });

  describe('getPitchClass', () => {
    it('should strip octave from pitch', () => {
      expect(getPitchClass('C4')).toBe('C');
      expect(getPitchClass('D#3')).toBe('D#');
      expect(getPitchClass('Gb2')).toBe('Gb');
    });
  });

  describe('isBlackKey', () => {
    it('should identify black keys correctly (only #)', () => {
      expect(isBlackKey('C#4')).toBe(true);
      expect(isBlackKey('D#3')).toBe(true);
      expect(isBlackKey('G#5')).toBe(true);
      expect(isBlackKey('Eb3')).toBe(false); // flats not recognized
      expect(isBlackKey('A4')).toBe(false);
      expect(isBlackKey('C4')).toBe(false);
    });
  });
});
