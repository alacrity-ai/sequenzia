// src/shared/playback/PlaybackEngine.test.ts

// npm run test -- src/shared/playback/PlaybackEngine.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaybackEngine, getPlaybackEngine } from './PlaybackEngine';
import * as audioModule from '@/sounds/audio/audio';
import type Sequencer from '@/components/sequencer/sequencer';

describe('PlaybackEngine Singleton', () => {
  beforeEach(() => {
    // Reset singleton between tests
    (PlaybackEngine as any).instance = null;
    vi.restoreAllMocks();
  });

  it('throws if getInstance is called before initialize', () => {
    expect(() => getPlaybackEngine()).toThrow('[PlaybackEngine] Instance not initialized. Call initialize() first.');
  });

  it('initializes singleton and returns instance', () => {
    vi.spyOn(audioModule, 'getAudioContext').mockReturnValue({
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
      suspend: vi.fn(),
    } as unknown as AudioContext);

    const sequencerMocks: Sequencer[] = [];
    PlaybackEngine.initialize(sequencerMocks);

    const instance = getPlaybackEngine();
    expect(instance).toBeInstanceOf(PlaybackEngine);

    // Subsequent initialize calls are ignored
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    PlaybackEngine.initialize(sequencerMocks);
    expect(warnSpy).toHaveBeenCalledWith('[PlaybackEngine] Instance already exists. Ignoring re-initialization.');
  });

  it('manages sequencer list correctly', () => {
    const sequencerA = { stopScheduledNotes: vi.fn() } as unknown as Sequencer;
    const sequencerB = { stopScheduledNotes: vi.fn() } as unknown as Sequencer;

    vi.spyOn(audioModule, 'getAudioContext').mockReturnValue({
      currentTime: 0,
      state: 'running',
      resume: vi.fn(),
      suspend: vi.fn(),
    } as unknown as AudioContext);

    PlaybackEngine.initialize([sequencerA]);
    const engine = getPlaybackEngine();

    engine.addSequencer(sequencerB);
    expect((engine as any).sequencers).toContain(sequencerB);

    engine.removeSequencer(sequencerA);
    expect((engine as any).sequencers).not.toContain(sequencerA);

    engine.clearSequencers();
    expect((engine as any).sequencers).toEqual([]);

    // validate stopScheduledNotes() was called during clearSequencers()
    expect(sequencerB.stopScheduledNotes).toHaveBeenCalled();
  });
});
