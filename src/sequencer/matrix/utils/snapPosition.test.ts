import { describe, it, expect } from 'vitest';
import { getSnappedNotePosition } from './snapPosition';
import type { GridScroll } from '../scrollbars/GridScroll';
import type { GridConfig } from '../interfaces/GridConfigTypes';

const mockScroll: GridScroll = {
  getX: () => 100,
  getY: () => 40
} as GridScroll;

const mockConfig: GridConfig = {
  layout: {
    labelWidth: 50,
    headerHeight: 20,
    baseCellWidth: 100,
    verticalCellRatio: 2,
    highestMidi: 71,
    lowestMidi: 60,
    minCellWidth: 40,
    maxCellWidth: 160,
    labelWidthColumns: 1,
    headerHeightRows: 2,
    footerHeightRows: 1,
    footerHeight: 40
  },
  behavior: {
    zoom: 1,
    scrollMargin: 48,
    enableSnapping: true,
    snapDivisions: 4,
    maxZoom: 2,
    minZoom: 0.5
  },
  totalMeasures: 4,
  beatsPerMeasure: 4,
  display: {
    showMeasureLines: true,
    showBeatLines: true,
    showHoveredCell: true,
    highlightCurrentMeasure: true
  }
};

describe('getSnappedNotePosition', () => {
  it('returns snapped position with standard resolution', () => {
    // mouse.x = 150px → (150 + scrollX - label) = 200 → 200 / 100 = 2
    const mouse = { x: 150, y: 60 };
    const result = getSnappedNotePosition(mouse, mockScroll, mockConfig, 1);
    expect(result).toEqual({ x: 2, y: 1 });
  });

  it('snaps to 0.25 resolution', () => {
    const mouse = { x: 175, y: 60 }; // 225 → 225 / 100 = 2.25
    const result = getSnappedNotePosition(mouse, mockScroll, mockConfig, 0.25);
    expect(result).toEqual({ x: 2.25, y: 1 });
  });

  it('snaps to triplet resolution (snap = 1 → effective = 2/3)', () => {
    const mouse = { x: 150, y: 60 }; // beatX = 2
    const result = getSnappedNotePosition(mouse, mockScroll, mockConfig, 1, true);
    expect(result).toEqual({ x: 2, y: 1 }); // ✅ correct expectation
  });  

  it('returns null if rowY is below grid', () => {
    const mouse = { x: 150, y: -500 }; // would yield negative y
    const result = getSnappedNotePosition(mouse, mockScroll, mockConfig, 1);
    expect(result).toBeNull();
  });

  it('returns null if rowY is beyond total rows', () => {
    const totalRows = mockConfig.layout.highestMidi - mockConfig.layout.lowestMidi + 1;
    const cellHeight = mockConfig.layout.baseCellWidth / mockConfig.layout.verticalCellRatio;

    // Mouse Y high enough to go past the total row count
    const mouse = {
      x: 150,
      y: (totalRows + 5) * cellHeight
    };

    const result = getSnappedNotePosition(mouse, mockScroll, mockConfig, 1);
    expect(result).toBeNull();
  });

  it('snaps correctly with zoom > 1', () => {
    const zoomedConfig = { ...mockConfig, behavior: { ...mockConfig.behavior, zoom: 2 } };
    const mouse = { x: 250, y: 60 };
  
    const result = getSnappedNotePosition(mouse, mockScroll, zoomedConfig, 1);
    expect(result).toEqual({ x: 1, y: 0 }); // ✅ correct expectation
  });  
});
