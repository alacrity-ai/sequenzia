// src/sequencer/sequencer.ts
import type { Note } from './interfaces/Note.js';
import type { SequencerConfig } from './interfaces/SequencerConfig.js';
import type { Instrument } from '../sounds/interfaces/Instrument.js';

import { getAudioContext, getMasterGain } from '../sounds/audio/audio.js';
import { getPreviewContext } from '../sounds/audio/previewContext.js';
import { exportNotesToOffline } from './services/offlineExportService.js';

import { initZoomControls } from './grid/interaction/zoomControlButtonHandlers.js';
import { getTotalMeasures, getTimeSignature } from './transport.js';
import { updateTrackStyle } from './ui/helpers/updateTrackStyle.js';
import { setCollapsed } from './ui/helpers/setCollapsed.js';
import { updateNoteRange, updateToDrumNoteRange } from './services/rangeUpdateService.js';

import { loadInstrument } from '../sounds/instrument-loader.js';
import { loadAndPlayNote } from '../sounds/instrument-player.js';

import { engine as playbackEngine } from '../main.js';
import { createGridInSequencerBody } from './matrix/utils/createGridInSequencerBody.js';
import { Grid } from './matrix/Grid.js';
import {
  stopScheduledNotes,
  preparePlayback,
  resumeAnimationsFromCurrentTime,
  reschedulePlayback
} from './services/playbackService.js';


export default class Sequencer {
  container: HTMLElement | null;
  config: SequencerConfig;
  context: AudioContext;
  destination: AudioNode;
  instrumentName: string;
  squelchLoadingScreen: boolean;
  colorIndex: number = 0;

  matrix?: Grid;

  id: number = 0;
  mute: boolean = false;
  solo: boolean = false;
  collapsed: boolean = false;

  private animationCanvas?: HTMLCanvasElement;
  private _scheduledAnimations: ReturnType<typeof setTimeout>[] = [];

  refreshPanUI?: () => void;
  refreshVolumeUI?: () => void;
  private _volume: number = 100 / 127;
  private _pan: number = 0.0;

  static allSequencers: Sequencer[] = [];

  static isAnySoloActive(): boolean {
    return Sequencer.allSequencers.some(seq => seq.solo);
  }

  static rescheduleAll(): void {
    if (!playbackEngine.isActive()) return;
  
    const startAt = playbackEngine.getStartTime();
    const startBeat = playbackEngine.getStartBeat();
  
    for (const seq of Sequencer.allSequencers) {
      seq.stopScheduledNotes();
      if (seq.shouldPlay) {
        void seq.reschedulePlayback(startAt, startBeat);
        void seq.resumeAnimationsFromCurrentTime(startAt, startBeat);
      }
    }
  }

  constructor(
    containerEl: HTMLElement | null,
    config: SequencerConfig,
    context: AudioContext = getAudioContext(),
    destination: AudioNode = getMasterGain(),
    instrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano',
    squelchLoadingScreen: boolean = false
    
  ) {
    Sequencer.allSequencers.push(this);

    this.container = containerEl;
    this.config = { ...config };
    this.context = context;
    this.destination = destination;
    this.instrumentName = instrument;
    this.squelchLoadingScreen = squelchLoadingScreen;

    if (this.container) {
      const body = this.container.querySelector('.sequencer-body') as HTMLElement;
    
      this.matrix = createGridInSequencerBody(body, {}, {
        playNote: this.playNote.bind(this),
        getId: () => this.id
      });
    
      this.matrix.refreshNoteRange();
      initZoomControls(this.container, () => this.matrix?.zoomIn(), () => this.matrix?.zoomOut(), () => this.matrix?.resetZoom());
    } 
  }

  private _instrument: Instrument | null = null;

  async initInstrument(): Promise<void> {
    try {
      this._instrument = await loadInstrument(this.instrumentName, this.context, this.destination, this._volume, this._pan);
      this.updateToDrumNoteRange();
    } catch (err) {
      console.warn(`[SEQ:${this.id}] Failed to load instrument '${this.instrumentName}':`, err);
    }
  }  

  setInstrument(name: string): void {
    this.instrumentName = name;
    this.updateTrackLabel();
    this.initInstrument();
  }

  updateTrackLabel(): void {
    const trackNameEl = this.container?.querySelector('.track-name');
    if (trackNameEl) {
      trackNameEl.textContent = `${this.id + 1}: ${this.instrumentName}`;
    }
  }

  get notes(): Note[] {
    return this.matrix?.notes ?? [] as Note[];
  }  

  get volume(): number {
    return this._volume;
  }

  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val)); // Clamp to [0, 1]
  
    if (this._instrument?.setVolume) {
      this._instrument.setVolume(this._volume);
    }
  }

  get pan(): number {
    return this._pan;
  }

  set pan(val: number) {
    this._pan = Math.max(-1, Math.min(1, val)); // Clamp to [-1.0, 1.0]

    if (this._instrument?.setPan) {
      this._instrument.setPan(this._pan);
    }
  }

  get shouldPlay(): boolean {
    return Sequencer.isAnySoloActive()
      ? this.solo
      : !this.mute;
  }  

  get scheduledAnimations(): number[] {
    return this._scheduledAnimations as unknown[] as number[];
  }

  set scheduledAnimations(val: number[]) {
    this._scheduledAnimations = val as unknown[] as ReturnType<typeof setTimeout>[];
  }

  get animCanvas(): HTMLCanvasElement | undefined {
    return this.animationCanvas;
  }

  toggleMute(): void {
    this.mute = !this.mute;
    if (this.mute) {
      this.solo = false;
    }
    this.stopScheduledNotes();
    updateTrackStyle(this);
  
    if (playbackEngine.isActive()) {
      Sequencer.rescheduleAll();
    }
  }
  
  toggleSolo(): void {
    this.solo = !this.solo;
    if (this.solo) {
      this.mute = false;
    }
    updateTrackStyle(this);
  
    if (playbackEngine.isActive()) {
      Sequencer.rescheduleAll();
    }
  }

  setCollapsed(val: boolean): void {
    setCollapsed(this, val);
  }

  async preparePlayback(startAt: number, startBeat: number = 0): Promise<void> {
    await preparePlayback(
      this._instrument as Instrument,
      () => this.initInstrument(),
      this.matrix?.notes ?? [],
      this.collapsed,
      this.matrix ?? null,
      this._scheduledAnimations as unknown[] as number[],
      startAt,
      startBeat
    );
  }  

  stopScheduledNotes(): void {
    stopScheduledNotes(this._instrument, this._scheduledAnimations as unknown[] as number[]);
  }  

  resumeAnimationsFromCurrentTime(startAt: number, startBeat: number): void {
    resumeAnimationsFromCurrentTime(
      this.matrix?.notes ?? [],
      startAt,
      startBeat,
      this.matrix ?? null,
      this.collapsed,
      this._scheduledAnimations as unknown[] as number[]
    );
  }
  
  async reschedulePlayback(startAt: number, startBeat: number = 0): Promise<void> {
    await reschedulePlayback(
      this._instrument as Instrument,
      () => this.initInstrument(),
      this.matrix?.notes ?? [],
      this.matrix ?? null,
      this.collapsed,
      this.mute,
      this.shouldPlay,
      this._scheduledAnimations as unknown[] as number[],
      startAt,
      startBeat
    );
  }

  async exportToOffline(signal?: AbortSignal, notesOverride?: Note[]): Promise<void> {
    const notes = notesOverride ?? this.matrix?.notes;
    if (!notes || notes.length === 0) return;
  
    await exportNotesToOffline(
      this.instrumentName,
      this.context,
      this.destination,
      notes,
      this._volume,
      this._pan,
      signal
    );
  }  

  // Used by grid when placing/manipulating notes
  playNote(pitch: string, durationSec: number, velocity = 100, loop = false): Promise<null> {
    return loadAndPlayNote(
      this.instrumentName,
      pitch,
      durationSec,
      velocity,
      loop,
      null,
      getPreviewContext(),
      this.destination,
      this.volume,
      this.pan
    );
  }  

  updateTotalMeasures(): void {
    if (!this.matrix) return;
    this.matrix.setMeasures(getTotalMeasures());
  }

  updateBeatsPerMeasure(): void {
    if (!this.matrix) return;
    this.matrix.setBeatsPerMeasure(getTimeSignature());
  }
  
  redraw(): void {
    this.matrix?.requestRedraw();
  }

  getState(): { notes: Note[]; config: SequencerConfig; instrument: string } {
    if (!this.matrix) return { notes: [], config: this.config, instrument: this.instrumentName };
    return {
      notes: [...this.matrix.notes],
      config: { ...this.config },
      instrument: this.instrumentName
    };
  }

  setState({
    notes,
    config,
    instrument,
    volume,
    pan,
  }: {
    notes: Note[];
    config: Partial<SequencerConfig>;
    instrument?: string;
    volume?: number;
    pan?: number;
  }): void {
    // Replace note array efficiently
    if (!this.matrix) return;
    this.matrix.setNotes(notes);
  
    // Update config (note grid layout only)
    Object.assign(this.config, config);
  
    // Apply volume and pan
    if (typeof volume === 'number') {
      this.volume = volume;
    }
    if (typeof pan === 'number') {
      this.pan = pan;
    }
  
    // Update instrument name (doesn't load it here)
    if (instrument) {
      this.instrumentName = instrument;
    }
  
    // Trigger visual update
    this.redraw();
  }   

  updateNotesFromTrackMap(trackMap: { n: [string, number, number, number?][] }): void {
    if (!this.matrix) return;
    this.matrix.notes.splice(
      0,
      this.matrix.notes.length,
      ...trackMap.n.map(([pitch, start, duration, velocity = 100]) => ({
        pitch,
        start,
        duration,
        velocity
      }))
    );
  }  

  /**
   * Updates the note range for this sequencer and refreshes the UI
   * @param range Tuple of [lowNote, highNote] (e.g., ['C3', 'C5'])
   */
  updateNoteRange(range: [string, string]): void {
    updateNoteRange({
      config: this.config,
      container: this.container,
      matrix: this.matrix!,
      instrumentName: this.instrumentName,
      colorIndex: this.colorIndex,
      getNotes: () => this.matrix?.notes ?? []
    }, range);
  }
  
  // Updates the note range for this sequencer to the default drum note range
  updateToDrumNoteRange(): void {
    updateToDrumNoteRange({
      config: this.config,
      container: this.container,
      matrix: this.matrix!,
      instrumentName: this.instrumentName,
      colorIndex: this.colorIndex,
      getNotes: () => this.matrix?.notes ?? []
    });
  }
  
  destroy(): void {
    this.stopScheduledNotes();
    this.container?.remove();
  }
}
