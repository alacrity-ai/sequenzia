// src/shared/playback/PlaybackEngine.ts

import { getAudioContext } from '@/sounds/audio/audio.js';
import { isLoopEnabled, getTotalBeats, getTempo } from '@/shared/playback/transportService.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

let instance: PlaybackEngine | null = null;

export function getPlaybackEngine(): PlaybackEngine {
  return PlaybackEngine.getInstance();
}

export class PlaybackEngine {
  private context!: AudioContext;
  private sequencers!: Sequencer[];

  private startTime = 0;
  private startBeat = 0;
  private isPlaying = false;
  private animationFrameId: number | null = null;

  private onResumeCallback: (() => void) | null = null;
  private onStopCallback: (() => void) | null = null;

  constructor(sequencers: Sequencer[]) {
    this.context = getAudioContext();
    this.sequencers = sequencers;
  }

  public static initialize(sequencers: Sequencer[]): void {
    if (instance) {
      console.warn('[PlaybackEngine] Instance already exists. Ignoring re-initialization.');
      return;
    }
    instance = new PlaybackEngine(sequencers);
  }

  public static getInstance(): PlaybackEngine {
    if (!instance) {
      throw new Error('[PlaybackEngine] Instance not initialized. Call initialize() first.');
    }
    return instance;
  }

  public setOnResumeCallback(cb: () => void): void {
    this.onResumeCallback = cb;
  }

  public setOnStopCallback(cb: () => void): void {
    this.onStopCallback = cb;
  }

  private tick = () => {
    if (!this.isPlaying) return;

    const currentBeat = this.getCurrentBeat();
    const endBeat = getTotalBeats();

    if (currentBeat >= endBeat) {
      if (isLoopEnabled()) {
        this.seek(0);
        this.start();
      } else {
        this.stop();
        this.onStopCallback?.();
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  public getCurrentBeat(): number {
    if (!this.isPlaying) return this.startBeat;
    const beatDuration = 60 / getTempo();
    return ((this.context.currentTime - this.startTime) / beatDuration) + this.startBeat;
  }

  public async start(): Promise<void> {
    const scheduleAt = this.context.currentTime + 0.1;

    this.startTime = scheduleAt;
    this.startBeat = 0;
    this.isPlaying = true;

    await this.scheduleAll(scheduleAt, this.startBeat);

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  public async pause(): Promise<void> {
    if (!this.isPlaying) return;

    const pauseBeat = this.getCurrentBeat();
    for (const seq of this.sequencers) {
      seq.stopScheduledNotes();
    }

    await this.context.suspend();

    this.startBeat = pauseBeat;
    this.isPlaying = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public async resume(): Promise<void> {
    if (this.isPlaying) return;

    await this.context.resume();
    const actualTime = this.context.currentTime;
    const scheduleAt = actualTime + 0.05;

    this.startTime = scheduleAt;

    await this.scheduleAll(scheduleAt, this.startBeat);

    this.isPlaying = true;
    this.onResumeCallback?.();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  public stop(): void {
    for (const seq of this.sequencers) {
      seq.stopScheduledNotes();
    }

    this.isPlaying = false;
    this.startBeat = 0;
    this.startTime = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // UI should handle play button state externally
  }

  public seek(toBeat: number): void {
    this.startBeat = toBeat;
    this.startTime = this.context.currentTime;

    const wasPlaying = this.isPlaying;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (wasPlaying) {
      const scheduleAt = this.context.currentTime + 0.05;
      this.startTime = scheduleAt;

      this.scheduleAll(scheduleAt, this.startBeat).then(() => {
        this.animationFrameId = requestAnimationFrame(this.tick);
      });

      if (this.context.state === 'suspended') {
        this.context.resume();
      }

      this.isPlaying = true;
    } else {
      this.isPlaying = false;
    }
  }

  public syncAfterTempoChange(oldBpm: number): void {
    const now = this.context.currentTime;
    const oldBeatDuration = 60 / oldBpm;
    const currentBeat = ((now - this.startTime) / oldBeatDuration) + this.startBeat;

    this.startBeat = currentBeat;
    this.startTime = now;
  }

  public setSequencers(newSeqs: Sequencer[]): void {
    this.sequencers = newSeqs;
  }

  // Idempotently add sequencer
  public addSequencer(seq: Sequencer): void {
    if (!this.sequencers.includes(seq)) {
      this.sequencers.push(seq);
    }
  }

  public removeSequencer(seq: Sequencer): void {
    this.sequencers = this.sequencers.filter(s => s !== seq);
  }

  public clearSequencers(): void {
    this.stop();
    this.sequencers = [];
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  public getStartTime(): number {
    return this.startTime;
  }

  public getStartBeat(): number {
    return this.startBeat;
  }

  private async scheduleAll(startTime: number, startBeat: number): Promise<void> {
    for (const seq of this.sequencers) {
      if (seq.shouldPlay) {
        await seq.preparePlayback(startTime, startBeat);
      } else {
        seq.stopScheduledNotes();
      }
    }
  }
}
