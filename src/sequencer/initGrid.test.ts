import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initGrid } from './initGrid';
import { Note } from './interfaces/Note';
import { GridConfig } from './interfaces/GridConfig';

describe('initGrid', () => {
  let canvas: HTMLCanvasElement;
  let playheadCanvas: HTMLCanvasElement;
  let animationCanvas: HTMLCanvasElement;
  let scrollContainer: HTMLElement;
  let sequencerMock: any;

  const dummyNotes: Note[] = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'E4', start: 1, duration: 1 },
  ];

  const dummyConfig: GridConfig = {
    noteRange: ['C2', 'C6'],
    isTripletMode: false,
    snapResolution: 0.25,
    currentDuration: 1,
  };

  beforeEach(() => {
    // Setup a fresh set of elements for every test
    canvas = document.createElement('canvas');
    playheadCanvas = document.createElement('canvas');
    animationCanvas = document.createElement('canvas');
    scrollContainer = document.createElement('div');
    sequencerMock = {
      container: document.createElement('div'),
    };
  });

  it('should initialize a grid with valid structure', () => {
    const grid = initGrid(
      canvas,
      playheadCanvas,
      animationCanvas,
      scrollContainer,
      dummyNotes,
      dummyConfig,
      sequencerMock
    );

    expect(grid).toBeDefined();
    expect(typeof grid.scheduleRedraw).toBe('function');
    expect(typeof grid.drawPlayhead).toBe('function');
    expect(typeof grid.getSelectedNote).toBe('function');
    expect(typeof grid.clearSelection).toBe('function');
    expect(typeof grid.zoomIn).toBe('function');
    expect(typeof grid.zoomOut).toBe('function');
    expect(typeof grid.setMouseHandler).toBe('function');
    expect(typeof grid.destroy).toBe('function');
  });

  it('should be able to select and clear notes', () => {
    const grid = initGrid(
      canvas,
      playheadCanvas,
      animationCanvas,
      scrollContainer,
      dummyNotes,
      dummyConfig,
      sequencerMock
    );

    const note: Note = { pitch: 'D4', start: 2, duration: 1 };

    grid.setSelectedNotes([note]);
    expect(grid.getSelectedNotes()).toEqual([note]);
    expect(grid.getSelectedNote()).toEqual(note);

    grid.clearSelection();
    expect(grid.getSelectedNotes()).toEqual([]);
    expect(grid.getSelectedNote()).toBeNull();
  });

  it('should calculate x position for beats correctly', () => {
    const grid = initGrid(
      canvas,
      playheadCanvas,
      animationCanvas,
      scrollContainer,
      dummyNotes,
      dummyConfig,
      sequencerMock
    );

    const x = grid.getXForBeat(4);
    expect(typeof x).toBe('number');
    expect(x).toBeGreaterThan(0);
  });

  it('should attach and detach mouse handlers properly', () => {
    const mockHandler = {
      attach: vi.fn(),
      detach: vi.fn(),
    };

    const grid = initGrid(
      canvas,
      playheadCanvas,
      animationCanvas,
      scrollContainer,
      dummyNotes,
      dummyConfig,
      sequencerMock
    );

    grid.setMouseHandler(mockHandler as any);
    expect(mockHandler.attach).toHaveBeenCalledWith(canvas);

    grid.setMouseHandler(null);
    expect(mockHandler.detach).toHaveBeenCalledWith(canvas);
  });

  it('should resize and redraw the canvas properly', () => {
    const grid = initGrid(
      canvas,
      playheadCanvas,
      animationCanvas,
      scrollContainer,
      dummyNotes,
      dummyConfig,
      sequencerMock
    );

    // Save initial dimensions
    const initialWidth = canvas.width;
    const initialHeight = canvas.height;

    // Force a zoom out (resizing)
    grid.zoomOut();
    expect(canvas.width).not.toBe(initialWidth);
    expect(canvas.height).not.toBe(initialHeight);
  });

});
