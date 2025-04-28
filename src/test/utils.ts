// src/test/utils.ts

import { vi } from 'vitest';
import { Note } from '../sequencer/interfaces/Note';
import { GridConfig } from '../sequencer/interfaces/GridConfig';

/**
 * Creates a standard set of test elements for grid tests
 */
export function setupGridTestElements() {
  const canvas = document.createElement('canvas');
  const playheadCanvas = document.createElement('canvas');
  const animationCanvas = document.createElement('canvas');
  const scrollContainer = document.createElement('div');
  const sequencerMock = {
    colorIndex: 0,
    container: document.createElement('div'),
  };

  // Add the global mini-contour element that's required
  const globalMiniContour = document.createElement('canvas');
  globalMiniContour.id = 'global-mini-contour';
  document.body.appendChild(globalMiniContour);

  return {
    canvas,
    playheadCanvas,
    animationCanvas,
    scrollContainer,
    sequencerMock
  };
}

/**
 * Creates sample data for grid tests
 */
export function setupGridTestData() {
  const dummyNotes: Note[] = [
    { pitch: 'C4', start: 0, duration: 1 },
    { pitch: 'E4', start: 1, duration: 1 },
  ];

  const dummyConfig: GridConfig = {
    noteRange: ['C2', 'C6'],
    isTripletMode: false,
    snapResolution: 0.25,
    currentDuration: 1,
    cellWidth: 20,
    cellHeight: 20,
    visibleNotes: 100,
    loopEnabled: false,
    useEqualTemperament: false
  };

  return {
    dummyNotes,
    dummyConfig
  };
}

// Mock the modules that initGrid depends on
export function mockDependencies() {
  // Mock all required imports
  vi.mock('../audio/pitch-utils.js', () => ({
    pitchToMidi: (pitch: string) => {
      // Simple mock implementation that works for tests
      if (pitch === 'C2') return 36;
      if (pitch === 'C6') return 84;
      if (pitch === 'C4') return 60;
      if (pitch === 'E4') return 64;
      if (pitch === 'D4') return 62;
      return 60; // default fallback
    },
    midiToPitch: (midi: number) => {
      // Reverse mapping
      if (midi === 36) return 'C2';
      if (midi === 84) return 'C6';
      if (midi === 60) return 'C4';
      if (midi === 64) return 'E4';
      if (midi === 62) return 'D4';
      return 'C4'; // default fallback
    },
    getPitchClass: (pitch: string) => pitch.charAt(0),
  }));

  vi.mock('../setup/sequencers.js', () => ({
    sequencers: []
  }));

  vi.mock('../sequencer/transport.js', () => ({
    getTotalBeats: () => 16
  }));

  vi.mock('../setup/editModeStore.js', () => ({
    subscribeEditMode: (callback: any) => {
      callback('note-placement');
      return () => {};
    },
    getEditMode: () => 'note-placement'
  }));

  vi.mock('../setup/selectionTracker.js', () => ({
    clearSelectionTracker: vi.fn()
  }));

  vi.mock('./grid/interaction/zoomControlButtonHandlers.js', () => ({
    initZoomControls: vi.fn()
  }));
}