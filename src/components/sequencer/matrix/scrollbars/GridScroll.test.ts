// src/components/sequencer/matrix/scrollbars/GridScroll.test.ts

// npm run test -- src/components/sequencer/matrix/scrollbars/GridScroll.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GridScroll } from './GridScroll';
import type { GridConfig } from '../interfaces/GridConfigTypes';

// Mock the gridDimensions module
vi.mock('../utils/gridDimensions', () => ({
    getContentWidth: vi.fn(() => 1200),     // default return
    getContentHeight: vi.fn(() => 960),     // default return
  }));

import { getContentWidth, getContentHeight } from '../utils/gridDimensions';

function setCanvasDimensions(canvas: HTMLElement, width: number, height: number) {
    Object.defineProperty(canvas, 'offsetWidth', { configurable: true, value: width });
    Object.defineProperty(canvas, 'offsetHeight', { configurable: true, value: height });
  }
  

describe('GridScroll', () => {
  let canvas: HTMLDivElement;
  let config: GridConfig;
  let scroll: GridScroll;

  beforeEach(() => {
    canvas = document.createElement('div');
    setCanvasDimensions(canvas, 800, 600);
    

    config = {
      totalMeasures: 16,
      beatsPerMeasure: 4,
      layout: {
        labelWidthColumns: 1,
        headerHeightRows: 2,
        footerHeightRows: 1,
        labelWidth: 80,
        headerHeight: 40,
        footerHeight: 40,
        baseCellWidth: 70,
        minCellWidth: 10,
        maxCellWidth: 200,
        verticalCellRatio: 4,
        highestMidi: 108,
        lowestMidi: 21,
      },
      display: {
        showMeasureLines: true,
        showBeatLines: true,
        showHoveredCell: true,
        highlightCurrentMeasure: true,
      },
      behavior: {
        zoom: 1.0,
        scrollMargin: 48,
        enableSnapping: true,
        snapDivisions: 4,
        maxZoom: 1.6,
        minZoom: 0.5,
      }
    };

    scroll = new GridScroll(canvas, config);
  });

  it('initial scroll is zero', () => {
    expect(scroll.getX()).toBe(0);
    expect(scroll.getY()).toBe(0);
  });

  it('sets scroll within bounds', () => {
    scroll.setScroll(100, 200);
    expect(scroll.getX()).toBe(100);
    expect(scroll.getY()).toBe(200);
  });

  it('clamps scrollX to max scrollable width', () => {
    (getContentWidth as any).mockReturnValue(1000); // content width
    setCanvasDimensions(canvas, 800, 600); // width = 800
    scroll.setScroll(5000, 0);
    expect(scroll.getX()).toBe(200); // 1000 - 800
  });
  
  it('clamps scrollY to max scrollable height', () => {
    (getContentHeight as any).mockReturnValue(1000); // content height
    setCanvasDimensions(canvas, 800, 600); // height = 600
    config.layout.headerHeight = 40;
    scroll.setScroll(0, 9999);
    expect(scroll.getY()).toBe(1000 - (600 - 40)); // 1000 - 560 = 440
  });
  
  it('returns correct max scroll X and Y', () => {
    (getContentWidth as any).mockReturnValue(1400);
    (getContentHeight as any).mockReturnValue(1200);
    setCanvasDimensions(canvas, 1000, 700); // width = 1000, height = 700
    config.layout.headerHeight = 50;
  
    expect(scroll.getMaxScrollX()).toBe(400); // 1400 - 1000
    expect(scroll.getMaxScrollY()).toBe(550); // 1200 - (700 - 50)
  });  

  it('delegates content dimensions to gridDimension utils', () => {
    scroll.getContentWidth();
    scroll.getContentHeight();
    expect(getContentWidth).toHaveBeenCalledWith(config);
    expect(getContentHeight).toHaveBeenCalledWith(config);
  });
});
