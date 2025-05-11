import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnappedFromEvent, getRawBeatFromEvent } from './snapping';
import { getSnappedNotePosition } from './snapPosition';
import { getGridRelativeMousePos, getRelativeMousePos } from './gridPosition';
import type { GridConfig } from '../interfaces/GridConfigTypes';
import type { GridScroll } from '../scrollbars/GridScroll';
import type { GridSnappingContext } from '../interfaces/GridSnappingContext';
import type { SnappedNotePosition } from '../interfaces/SnappedNotePosition';

vi.mock('./snapPosition', () => ({
  getSnappedNotePosition: vi.fn()
}));

vi.mock('./gridPosition', () => ({
  getRelativeMousePos: vi.fn(),
  getGridRelativeMousePos: vi.fn()
}));

const mockScroll: GridScroll = {
  getX: () => 0,
  getY: () => 0
} as GridScroll;

const mockConfig: GridConfig = {
  layout: {
    labelWidth: 0,
    headerHeight: 0,
    baseCellWidth: 100,
    minCellWidth: 20,
    maxCellWidth: 200,
    verticalCellRatio: 2,
    lowestMidi: 60,
    highestMidi: 72,
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

const mockGrid: GridSnappingContext = {
  getSnapResolution: () => 1,
  isTripletMode: () => false
} as GridSnappingContext;

describe('snapping utils', () => {
  const mockEvent = { clientX: 200, clientY: 100 } as MouseEvent;
  const mockMousePos = { x: 200, y: 100 };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    (getRelativeMousePos as vi.Mock).mockReturnValue(mockMousePos);
    // @ts-ignore
    (getGridRelativeMousePos as vi.Mock).mockReturnValue(mockMousePos);
  });

  it('computes raw beat from mouse event', () => {
    const result = getRawBeatFromEvent(mockEvent, document.createElement('div'), mockScroll, mockConfig);
    // cellWidth = 100, x = 200 → 200 / 100 = 2
    expect(result).toBe(2);
  });

  it('returns snapped position from mouse event via getSnappedNotePosition', () => {
    const expected: SnappedNotePosition = { x: 4, y: 2 };
    // @ts-ignore
    (getSnappedNotePosition as vi.Mock).mockReturnValue(expected);

    const result = getSnappedFromEvent(mockEvent, document.createElement('div'), mockGrid, mockScroll, mockConfig);

    expect(getSnappedNotePosition).toHaveBeenCalledWith(
      mockMousePos,
      mockScroll,
      mockConfig,
      1,       // snap resolution
      false    // triplet mode
    );
    expect(result).toEqual(expected);
  });

  it('respects triplet mode and different snap resolution', () => {
    const expected: SnappedNotePosition = { x: 3, y: 5 };

    const altGrid: GridSnappingContext = {
      getSnapResolution: () => 2,
      isTripletMode: () => true
    } as GridSnappingContext;

    // @ts-ignore
    (getSnappedNotePosition as vi.Mock).mockReturnValue(expected);

    const result = getSnappedFromEvent(mockEvent, document.createElement('div'), altGrid, mockScroll, mockConfig);

    expect(getSnappedNotePosition).toHaveBeenCalledWith(
      mockMousePos,
      mockScroll,
      mockConfig,
      2,
      true
    );
    expect(result).toEqual(expected);
  });
});
