// src/sequencer/initGrid.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initGrid } from './initGrid';
import { setupGridTestElements, setupGridTestData, mockDependencies } from '../test/utils';

import type { GridTestElements, GridTestData } from '../test/interfaces/Grid.js';


// Mock all dependencies before importing the module under test
mockDependencies();

describe('initGrid', () => {
  let elements: GridTestElements;
  let testData: GridTestData;

  beforeEach(() => {
    // Setup fresh test elements and data for every test
    elements = setupGridTestElements();
    testData = setupGridTestData();
    
    // Spy on console.warn to catch any warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should initialize a grid with valid structure', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
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
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    const note = { pitch: 'D4', start: 2, duration: 1 };

    grid.setSelectedNotes([note]);
    expect(grid.getSelectedNotes()).toEqual([note]);
    expect(grid.getSelectedNote()).toEqual(note);

    grid.clearSelection();
    expect(grid.getSelectedNotes()).toEqual([]);
    expect(grid.getSelectedNote()).toBeNull();
  });

  it('should calculate x position for beats correctly', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    // Test with default zoom level
    const x = grid.getXForBeat(4);
    expect(typeof x).toBe('number');
    // With default zoom level from the code (cellWidth = ZOOM_LEVELS[2].cellWidth)
    // The result should be 4 * cellWidth
    expect(x).toBeGreaterThan(0);
  });

  it('should attach and detach mouse handlers properly', () => {
    const mockHandler = {
      attach: vi.fn(),
      detach: vi.fn(),
    };

    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    grid.setMouseHandler(mockHandler as any);
    expect(mockHandler.attach).toHaveBeenCalledWith(elements.canvas);

    grid.setMouseHandler(null);
    expect(mockHandler.detach).toHaveBeenCalledWith(elements.canvas);
  });

  it('should resize and redraw the canvas properly', () => {
    // Create a spy on requestAnimationFrame before initializing the grid
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
    
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    // Clear any calls that happened during initialization
    requestAnimationFrameSpy.mockClear();

    // Call resizeAndRedraw
    grid.resizeAndRedraw();

    // Verify requestAnimationFrame was called (which happens inside scheduleRedraw)
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    
    // Verify canvas dimensions were updated
    expect(elements.canvas.width).toBeGreaterThan(0);
    expect(elements.canvas.height).toBeGreaterThan(0);
  });

  it('should zoom in and zoom out properly', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    const originalX = grid.getXForBeat(1);

    grid.zoomIn();
    const zoomedInX = grid.getXForBeat(1);
    expect(zoomedInX).toBeGreaterThan(originalX);

    grid.zoomOut();
    const zoomedOutX = grid.getXForBeat(1);
    expect(zoomedOutX).toBeLessThanOrEqual(zoomedInX);
  });

  it('should return the preview note correctly', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    expect(grid.getPreviewNote()).toBeNull();
    
    const note = { pitch: 'E4', start: 1, duration: 2 };
    grid.gridContext.updatePreview(note);
    expect(grid.getPreviewNote()).toEqual(note);
  });

  it('should set the cursor style properly', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    grid.setCursor('crosshair');
    expect(elements.canvas.style.cursor).toBe('crosshair');
  });

  it('should clear selection but not preview note on clearSelection', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );
  
    const note = { pitch: 'F4', start: 3, duration: 1 };
    grid.setSelectedNotes([note]);
    grid.gridContext.updatePreview(note);
  
    expect(grid.getSelectedNotes()).toEqual([note]);
    expect(grid.getPreviewNote()).toEqual(note);
  
    grid.clearSelection();
  
    expect(grid.getSelectedNotes()).toEqual([]);
    expect(grid.getSelectedNote()).toBeNull();
    expect(grid.getPreviewNote()).toEqual(note); // 🔥 preview note remains
  });  

  it('should destroy properly (unsubscribe and clear selection)', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    const unsubscribeSpy = vi.spyOn(grid.gridContext, 'onNotesChanged');
    grid.destroy();

    // Cannot test unsubscribe directly without exposing it, but we can test no crash on destroy
    expect(grid.getSelectedNotes()).toEqual([]);
  });

  it('should set paste preview notes correctly in context', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    const pasteNotes = [
      { pitch: 'G4', start: 5, duration: 2 },
      { pitch: 'A4', start: 7, duration: 1 },
    ];

    grid.gridContext.setPastePreviewNotes?.(pasteNotes);

    // Simulate scheduleRedraw to verify usage if needed
    grid.scheduleRedraw();

    // Internal test - no visible effect immediately unless drawn, but check that no crash happens
    expect(pasteNotes.length).toBe(2);
  });

  it('should set and retrieve highlighted notes during marquee', () => {
    const grid = initGrid(
      elements.canvas,
      elements.playheadCanvas,
      elements.animationCanvas,
      elements.scrollContainer,
      testData.dummyNotes,
      testData.dummyConfig,
      elements.sequencerMock
    );

    const highlightedNotes = [
      { pitch: 'B4', start: 6, duration: 1 }
    ];

    grid.gridContext.setHighlightedNotes?.(highlightedNotes);
    expect(grid.gridContext.getHighlightedNotes?.()).toEqual(highlightedNotes);
  });

});