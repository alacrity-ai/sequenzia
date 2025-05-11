// src/components/sequencer/services/rangeUpdateService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateNoteRange, updateToDrumNoteRange } from './rangeUpdateService';
import { DRUM_MIDI_TO_NAME } from '@/sounds/loaders/constants/drums';

vi.mock('@/components/sequencer/ui/renderers/drawMiniContour', () => ({
  drawMiniContour: vi.fn(),
}));

vi.mock('@/shared/utils/musical/noteUtils', () => {
  const midiMap: Record<string, number> = {
    A0: 21,
    C9: 108,
    B1: 35,
    A5: 81,
  };

  return {
    pitchToMidi: (note: string): number | null => midiMap[note] ?? null,
    midiRangeBetween: (high: string, low: string): number => {
      const highMidi = midiMap[high];
      const lowMidi = midiMap[low];
      if (highMidi === undefined || lowMidi === undefined) {
        throw new Error(`Invalid pitches: ${low}, ${high}`);
      }
      return highMidi - lowMidi;
    },
  };
});

vi.mock('@/main', () => ({}));

import * as MiniContourModule from '@/components/sequencer/ui/renderers/drawMiniContour';

describe('rangeUpdateService', () => {
  let config: any;
  let matrix: any;
  let container: HTMLElement;
  let miniCanvas: HTMLCanvasElement;
  let context: any;

  beforeEach(() => {
    config = {
      noteRange: null,
      visibleNotes: 0,
    };

    matrix = {
      setNoteRange: vi.fn(),
      setCustomLabels: vi.fn(),
    };

    miniCanvas = document.createElement('canvas');
    miniCanvas.classList.add('mini-contour');

    container = document.createElement('div');
    container.appendChild(miniCanvas);

    context = {
      config,
      container,
      matrix,
      instrumentName: '',
      colorIndex: 1,
      getNotes: () => [{ pitch: 'C4', start: 0, duration: 1, velocity: 100 }],
    };
  });

  describe('updateNoteRange', () => {
    it('updates config and matrix with valid note range', () => {
      updateNoteRange(context, ['A0', 'C9']);

      expect(config.noteRange).toEqual(['A0', 'C9']);
      expect(config.visibleNotes).toBe(88); // inclusive range
      expect(matrix.setNoteRange).toHaveBeenCalledWith(21, 108);
    });

    it('warns and exits if pitchToMidi returns null', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      updateNoteRange(context, ['Z9', 'C9']);
      expect(warn).toHaveBeenCalledWith('Invalid note range: Z9,C9');
      expect(matrix.setNoteRange).not.toHaveBeenCalled();
    });

    it('warns and exits if lowMidi >= highMidi', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      updateNoteRange(context, ['C9', 'A0']);
      expect(warn).toHaveBeenCalledWith('Invalid note range: low note must be lower than high note');
      expect(matrix.setNoteRange).not.toHaveBeenCalled();
    });
  });

  describe('updateToDrumNoteRange', () => {
    it('sets full note range and clears drum labels for non-drum instruments', () => {
      context.instrumentName = 'piano';
      updateToDrumNoteRange(context);

      expect(config.noteRange).toEqual(['A0', 'C9']);
      expect(matrix.setNoteRange).toHaveBeenCalledWith(21, 108);
      expect(matrix.setCustomLabels).toHaveBeenCalledWith(null);
    });

    it('sets drum-specific range and applies drum labels for drum kits', () => {
      context.instrumentName = 'TR-808 Drum Kit';
      updateToDrumNoteRange(context);

      expect(config.noteRange).toEqual(['B1', 'A5']);
      expect(matrix.setNoteRange).toHaveBeenCalledWith(35, 81);
      expect(matrix.setCustomLabels).toHaveBeenCalledWith(DRUM_MIDI_TO_NAME);
    });
  });
});
