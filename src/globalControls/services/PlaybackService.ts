// src/globalControls/services/PlaybackService.ts

import type Sequencer from '@/sequencer/sequencer.js';
import type { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import {
  startGlobalPlayheadLoop,
  cancelGlobalPlayheadLoop,
  resetGlobalPlayheads
} from './GlobalPlayheadService.js';

export class PlaybackService {
  private engine: PlaybackEngine;
  private playheadCanvasWidth: number;

  constructor(engine: PlaybackEngine) {
    this.engine = engine;
    this.playheadCanvasWidth = 300

    this.engine.setOnResumeCallback(() => {
      startGlobalPlayheadLoop(this.engine, this.playheadCanvasWidth);
    });

    this.engine.setOnStopCallback(() => {
      this.onStop?.();
    });
  }

  private onStop: (() => void) | null = null;

  public play(): void {
    this.engine.start();
    startGlobalPlayheadLoop(this.engine, this.playheadCanvasWidth);
  }

  public stop(): void {
    this.engine.stop();
    cancelGlobalPlayheadLoop();
    resetGlobalPlayheads(this.engine);
  }

  public setOnStopCallback(cb: () => void): void {
    this.onStop = cb;
  }

  public async pause(): Promise<void> {
    await this.engine.pause();
    cancelGlobalPlayheadLoop();
  }

  public async resume(): Promise<void> {
    await this.engine.resume();
  }

  public toggle(): void {
    this.engine.isActive() ? this.pause() : this.resume();
  }

  public isPlaying(): boolean {
    return this.engine.isActive();
  }

  public getEngine(): PlaybackEngine {
    return this.engine;
  }

  public setSequencers(seqs: Sequencer[]): void {
    this.engine.setSequencers(seqs);
  }

  public setPlayheadCanvasWidth(width: number): void {
    this.playheadCanvasWidth = width;
  }
}
