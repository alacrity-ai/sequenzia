// src/sequencer/grid/helpers/geometry.test.ts

import { describe, it, expect } from 'vitest';
import { getRawBeatFromX, getSnappedBeat, getSnappedBeatFromX } from './geometry';

describe('geometry helpers', () => {
  describe('getRawBeatFromX', () => {
    it('should calculate raw beat from x position', () => {
      const getCellWidth = () => 50; // 50px per beat
      expect(getRawBeatFromX(0, getCellWidth)).toBe(0);
      expect(getRawBeatFromX(100, getCellWidth)).toBe(2);
      expect(getRawBeatFromX(25, getCellWidth)).toBe(0.5);
      expect(getRawBeatFromX(75, getCellWidth)).toBe(1.5);
    });
  });

  describe('getSnappedBeat', () => {
    it('should snap beat to nearest grid point with standard resolution', () => {
      const config = { snapResolution: 1, isTripletMode: false };
      expect(getSnappedBeat(0, config)).toBe(0);
      expect(getSnappedBeat(0.3, config)).toBe(0);
      expect(getSnappedBeat(0.6, config)).toBe(1);
      expect(getSnappedBeat(1.2, config)).toBe(1);
      expect(getSnappedBeat(1.8, config)).toBe(2);
    });

    it('should snap beat correctly with smaller resolution (quarter notes)', () => {
      const config = { snapResolution: 0.25, isTripletMode: false };
      expect(getSnappedBeat(0.1, config)).toBe(0);
      expect(getSnappedBeat(0.2, config)).toBe(0.25);
      expect(getSnappedBeat(0.4, config)).toBe(0.5);
      expect(getSnappedBeat(0.9, config)).toBe(1);
    });

    it('should snap beat correctly in triplet mode', () => {
      const config = { snapResolution: 0.25, isTripletMode: true }; // triplet factor (2/3)
      expect(getSnappedBeat(0, config)).toBe(0);
      expect(getSnappedBeat(0.1, config)).toBeCloseTo(0.1667, 3);
      expect(getSnappedBeat(0.3, config)).toBeCloseTo(0.3333, 3);
      expect(getSnappedBeat(0.5, config)).toBeCloseTo(0.5, 1); // snaps around 0.5
    });
  });

  describe('getSnappedBeatFromX', () => {
    it('should calculate and snap beat from x position', () => {
      const getCellWidth = () => 100;
      const config = { snapResolution: 1, isTripletMode: false };

      expect(getSnappedBeatFromX(0, config, getCellWidth)).toBe(0);
      expect(getSnappedBeatFromX(50, config, getCellWidth)).toBe(1);
      expect(getSnappedBeatFromX(250, config, getCellWidth)).toBe(3);
    });

    it('should calculate and snap beat from x with triplet mode enabled', () => {
      const getCellWidth = () => 60;
      const config = { snapResolution: 0.25, isTripletMode: true };

      const snapped = getSnappedBeatFromX(90, config, getCellWidth);
      expect(snapped).toBeCloseTo(1.5, 2);
    });
  });
});
