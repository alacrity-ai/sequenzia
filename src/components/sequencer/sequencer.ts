// src/components/sequencer/sequencer.ts

import type { Note } from '@/shared/interfaces/Note.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';
import type { Instrument } from '@/sounds/interfaces/Instrument.js';

import { getAudioContext, getMasterGain } from '@/sounds/audio/audio.js';
import { getPreviewContext } from '@/sounds/audio/previewContext.js';
import { exportNotesToOffline } from '@/components/sequencer/services/offlineExportService.js';

import { getTotalMeasures, getTimeSignature } from '@/shared/playback/transportService.js';
import { updateTrackStyle } from '@/components/sequencer/ui/helpers/updateTrackStyle.js';
import { updateNoteRange, updateToDrumNoteRange } from '@/components/sequencer/services/rangeUpdateService.js';
import { rescheduleAllSequencers, isAnySoloActive, unregisterSequencer } from '@/components/sequencer/stores/sequencerStore.js';
import { setCollapsed } from '@/components/sequencer/utils/collapseSequencer.js';

import { loadInstrument } from '@/sounds/instrument-loader.js';
import { loadAndPlayNote } from '@/sounds/instrument-player.js';

import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { createGridInSequencerBody } from '@/components/sequencer/matrix/utils/createGridInSequencerBody.js';
import { Grid } from '@/components/sequencer/matrix/Grid.js';
import {
  stopScheduledNotes,
  preparePlayback,
  resumeAnimationsFromCurrentTime,
  reschedulePlayback
} from '@/components/sequencer/services/playbackService.js';


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
  miniContour: HTMLCanvasElement | null = null;
  body: HTMLElement | null = null;
  collapseIcon: SVGUseElement | null = null;

  private _scheduledAnimations: ReturnType<typeof setTimeout>[] = [];

  refreshPanUI?: () => void;
  refreshVolumeUI?: () => void;
  private _volume: number = 100 / 127;
  private _pan: number = 0.0;

  constructor(
    containerEl: HTMLElement | null,
    config: SequencerConfig,
    context: AudioContext = getAudioContext(),
    destination: AudioNode = getMasterGain(),
    instrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano',
    squelchLoadingScreen: boolean = false,
    id: number = 0
  ) {
    this.id = id;
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
    } 
  }

  private _instrument: Instrument | null = null;

  async initInstrument(): Promise<void> {
    try {
      this._instrument = await loadInstrument(this.instrumentName, this.context, this.destination, this._volume, this._pan, false, false);
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
    return isAnySoloActive()
      ? this.solo
      : !this.mute;
  }  

  get scheduledAnimations(): number[] {
    return this._scheduledAnimations as unknown[] as number[];
  }

  set scheduledAnimations(val: number[]) {
    this._scheduledAnimations = val as unknown[] as ReturnType<typeof setTimeout>[];
  }

  toggleMute(): void {
    const playbackEngine = PlaybackEngine.getInstance();
    this.mute = !this.mute;
    if (this.mute) {
      this.solo = false;
    }
    this.stopScheduledNotes();
    updateTrackStyle(this);

    if (playbackEngine.isActive()) {
      rescheduleAllSequencers();
    }
  }
  
  toggleSolo(): void {
    const playbackEngine = PlaybackEngine.getInstance();
    this.solo = !this.solo;
    if (this.solo) {
      this.mute = false;
    }
    updateTrackStyle(this);
  
    if (playbackEngine.isActive()) {
      rescheduleAllSequencers();
    }
  }

  setCollapsed(val: boolean): void {
    this.collapsed = val;
  }

  resetInteractionMode(): void {
    this.matrix?.getInteractionContext().reset();
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
    collapsed
  }: {
    notes: Note[];
    config: Partial<SequencerConfig>;
    instrument?: string;
    volume?: number;
    pan?: number;
    collapsed?: boolean;
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
  
    // Apply collapsed
    setCollapsed(this, collapsed);

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
    // Cleanup
    this.stopScheduledNotes();
    this.matrix?.destroy();
    this.container?.remove();

    // Remove from store
    unregisterSequencer(this.id);

    // Remove from playback engine
    PlaybackEngine.getInstance().removeSequencer(this);

    // Reference cleanup
    this._instrument = null;
    this.matrix = undefined;
    this.container = null;
    this.refreshPanUI = undefined;
    this.refreshVolumeUI = undefined;
  }
}
