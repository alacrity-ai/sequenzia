import { describe, it, expect } from 'vitest';
import { getNotesInMarquee } from './marqueeUtils';
import type { Note } from '@/shared/interfaces/Note';
import type { GridConfig } from '../interfaces/GridConfigTypes';
import type { GridScroll } from '../scrollbars/GridScroll';
import type { GridSnappingContext } from '../interfaces/GridSnappingContext';

const mockConfig: GridConfig = {
  totalMeasures: 4,
  beatsPerMeasure: 4,
  layout: {
    baseCellWidth: 100,
    verticalCellRatio: 4,
    labelWidth: 80,
    headerHeight: 40,
    footerHeight: 40,
    labelWidthColumns: 1,
    headerHeightRows: 2,
    footerHeightRows: 1,
    lowestMidi: 60,
    highestMidi: 72,
    minCellWidth: 40,
    maxCellWidth: 120
  },
  behavior: {
    zoom: 1,
    scrollMargin: 48,
    enableSnapping: true,
    snapDivisions: 4,
    maxZoom: 2,
    minZoom: 0.5
  },
  display: {
    showMeasureLines: true,
    showBeatLines: true,
    showHoveredCell: true,
    highlightCurrentMeasure: true
  }
};

const mockGrid: GridSnappingContext = {
  getSnapResolution: () => 1
} as GridSnappingContext;

const notes: Note[] = [
  { pitch: 'C4', start: 2, duration: 1, velocity: 100 },  // in
  { pitch: 'D4', start: 5, duration: 1, velocity: 100 },  // out of time
  { pitch: 'E4', start: 3, duration: 1, velocity: 100 },  // in
  { pitch: 'C3', start: 2, duration: 1, velocity: 100 },  // out of pitch
  { pitch: 'C4', start: 2, duration: 3, velocity: 100 }   // extends beyond end beat → out
];

describe('getNotesInMarquee', () => {
  // it('returns notes fully within the marquee selection region', () => {
  //   const box = {
  //     startX: 200,    // corresponds to beat 2
  //     currentX: 400,  // beat 4
  //     startY: 0,
  //     currentY: 200   // several pitch rows
  //   };

  //   const result = getNotesInMarquee(notes, box, {} as GridScroll, mockConfig, mockGrid);
  //   expect(result.map(n => n.pitch)).toEqual(['C4', 'E4']);
  // });

  // it('handles inverted marquee selection (dragging up-left)', () => {
  //   const box = {
  //     startX: 400,
  //     currentX: 200,
  //     startY: 200,
  //     currentY: 0
  //   };

  //   const result = getNotesInMarquee(notes, box, {} as GridScroll, mockConfig, mockGrid);
  //   expect(result.map(n => n.pitch)).toEqual(['C4', 'E4']);
  // });

  it('excludes notes outside pitch range', () => {
    const box = {
      startX: 200,
      currentX: 400,
      startY: 0,
      currentY: 200
    };

    const result = getNotesInMarquee(notes, box, {} as GridScroll, mockConfig, mockGrid);
    expect(result.find(n => n.pitch === 'C3')).toBeUndefined();
  });

  it('excludes notes that start inside but extend beyond marquee bounds', () => {
    const box = {
      startX: 200,
      currentX: 400,
      startY: 0,
      currentY: 200
    };

    const result = getNotesInMarquee(notes, box, {} as GridScroll, mockConfig, mockGrid);
    expect(result.find(n => n.duration === 3)).toBeUndefined();
  });

  // it('respects snapping logic (snap = 2 beats)', () => {
  //   const gridSnap2: GridSnappingContext = {
  //     getSnapResolution: () => 2
  //   } as GridSnappingContext;

  //   const box = {
  //     startX: 200,
  //     currentX: 400,
  //     startY: 0,
  //     currentY: 200
  //   };

  //   // With snap = 2, this becomes [2, 4] in 2-beat intervals
  //   const result = getNotesInMarquee(notes, box, {} as GridScroll, mockConfig, gridSnap2);
  //   expect(result.map(n => n.pitch)).toContain('C4');
  //   expect(result.map(n => n.pitch)).not.toContain('E4'); // start = 3, not on snapped boundary
  // });

  it('includes notes exactly at the edge of the box', () => {
    const edgeNote: Note = { pitch: 'G4', start: 4, duration: 1, velocity: 100 };
    const box = {
      startX: 400, // beat 4
      currentX: 500, // beat 5
      startY: 0,
      currentY: 200
    };

    const result = getNotesInMarquee([edgeNote], box, {} as GridScroll, mockConfig, mockGrid);
    expect(result.map(n => n.pitch)).toContain('G4');
  });
});
