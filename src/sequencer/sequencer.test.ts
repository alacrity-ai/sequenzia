// src/sequencer/sequencer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sequencer from './sequencer';
import { setupGridTestElements, mockDependencies } from '../test/utils';
import { GridConfig } from './interfaces/GridConfig';
import type { TrackTuple } from './interfaces/TrackTuple';
import { loadInstrument } from '../sounds/instrument-loader';
import { loadAndPlayNote } from '../sounds/instrument-player';

interface TestGridConfig extends Partial<GridConfig> {
    noteRange: [string, string];
    cellWidth: number;
    cellHeight: number;
  }

  function createTestGridConfig(overrides: Partial<TestGridConfig> = {}): GridConfig {
    return {
      noteRange: ['C3', 'C5'],
      cellWidth: 20,
      cellHeight: 20,
      visibleNotes: 24,
      currentDuration: 1,
      snapResolution: 1,
      isTripletMode: false,
      loopEnabled: false,
      useEqualTemperament: true,
      ...(overrides as Partial<GridConfig>),
    };
  }

vi.mock('./initGrid', () => ({
  initGrid: vi.fn(() => ({
    scheduleRedraw: vi.fn(),
    drawPlayhead: vi.fn(),
    getXForBeat: vi.fn((beat: number) => beat * 20),
    gridContext: {},
  })),
}));

vi.mock('../sounds/instrument-loader', () => {
    return {
      loadInstrument: vi.fn(async () => ({})),  // <-- now spy-enabled
      getAvailableEngines: () => ['sf2'],
      getAvailableLibraries: vi.fn(() => Promise.resolve(['fluidr3-gm'])),
      getAvailableInstruments: vi.fn(() => Promise.resolve(['acoustic_grand_piano'])),
    };
});

vi.mock('../sounds/instrument-player', () => ({
  loadAndPlayNote: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('./grid/drawing/mini-contour', () => ({
  drawMiniContour: vi.fn(),
}));

vi.mock('./grid/animation/notePlayAnimation', () => ({
  animateNotePlay: vi.fn(),
}));

vi.mock('./transport', () => ({
  onBeatUpdate: vi.fn((handler) => {
    const interval = setInterval(() => handler(0), 100);
    return () => clearInterval(interval);
  }),
  getTempo: vi.fn(() => 120),
  getTotalBeats: vi.fn(() => 64),
}));

describe('Sequencer', () => {
  let elements: ReturnType<typeof setupGridTestElements>;

  beforeEach(() => {
    mockDependencies();
    elements = setupGridTestElements();
  });

  it('should initialize correctly', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    expect(sequencer.container).toBe(elements.scrollContainer);
    expect(sequencer.config).toBeDefined();
    expect(sequencer.notes).toEqual([]);
    expect(sequencer.grid).toBeDefined();
  });

  it('should load an instrument successfully', async () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    await sequencer.initInstrument();
    expect(loadInstrument).toHaveBeenCalledWith(
        'sf2/fluidr3-gm/acoustic_grand_piano',
        expect.anything(),
        expect.anything(),
        expect.any(Number),
        expect.any(Number)
      );
      
      
  });

  it('should play a note', async () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    await sequencer.playNote('C4', 1);
    expect(loadAndPlayNote).toHaveBeenCalled();
  });

  it('should toggle mute and solo', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    sequencer.toggleMute();
    expect(sequencer.mute).toBe(true);
    expect(sequencer.solo).toBe(false);

    sequencer.toggleSolo();
    expect(sequencer.solo).toBe(true);
    expect(sequencer.mute).toBe(false);
  });

  it('should return and set state', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());

    const state = sequencer.getState();
    expect(state.notes).toEqual([]);
    expect(state.config.noteRange).toEqual(['C3', 'C5']);
    expect(state.instrument).toBe('sf2/fluidr3-gm/acoustic_grand_piano');

    const newNotes = [{ pitch: 'D4', start: 0, duration: 1 }];
    sequencer.setState({ notes: newNotes, config: { cellWidth: 30 }, instrument: 'new-instrument' });

    expect(sequencer.notes).toEqual(newNotes);
    expect(sequencer.config.cellWidth).toBe(30);
    expect(sequencer.instrumentName).toBe('new-instrument');
  });

  it('should play and stop correctly', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    sequencer.play();
    expect((sequencer as any)._beatHandler).toBeDefined();
    sequencer.stop();
    expect((sequencer as any)._beatHandler).toBeNull();

  });

  it('should pause and resume', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    sequencer.play();
  
    sequencer.pause();
    expect((sequencer as any)._unsub).toBeNull(); // unsubscribed
    expect((sequencer as any)._beatHandler).toBeDefined(); // handler remains
  
    sequencer.resume();
    expect((sequencer as any)._unsub).toBeDefined(); // resubscribed
    expect((sequencer as any)._beatHandler).toBeDefined(); // handler still remains
  });  

  it('should seekTo by restarting playback', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    sequencer.play = vi.fn();
    sequencer.stop = vi.fn();
    sequencer.seekTo(10);
    expect(sequencer.stop).toHaveBeenCalled();
    expect(sequencer.play).toHaveBeenCalled();
  });

  it('should update notes from track map', () => {
    const sequencer = new Sequencer(elements.scrollContainer, createTestGridConfig());
    const trackMap: TrackTuple = { n: [['C4', 0, 2], ['D4', 2, 2]] };
    sequencer.updateNotesFromTrackMap(trackMap);
    expect(sequencer.notes.length).toBe(2);
    expect(sequencer.notes[0]).toEqual({ pitch: 'C4', start: 0, duration: 2 });
  });

  it('should destroy and remove container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const sequencer = new Sequencer(container, createTestGridConfig());
    sequencer.destroy();
    expect(document.body.contains(container)).toBe(false);
  });
});
