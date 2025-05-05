// src/sequencer/sequencer.ts
// import { initGrid } from './initGrid.js';
import { getAudioContext, getMasterGain } from '../sounds/audio/audio.js';
import { initZoomControls } from './grid/interaction/zoomControlButtonHandlers.js';
import { getTempo, getTotalMeasures } from './transport.js';
import { loadInstrument } from '../sounds/instrument-loader.js';
import { loadAndPlayNote } from '../sounds/instrument-player.js'; // Changed from sf2-player.js
import { pitchToMidi } from '../sounds/audio/pitch-utils.js';
import { drawMiniContour } from './grid/drawing/mini-contour.js';
import type { Note } from './interfaces/Note.js';
import type { SequencerConfig } from './interfaces/SequencerConfig.js';
import { midiRangeBetween } from './grid/helpers/note-finder.js';
import { Instrument } from '../sounds/interfaces/Instrument.js';
import { HandlerContext as GridContext } from './interfaces/HandlerContext.js';
import { engine as playbackEngine } from '../main.js';
import { createGridInSequencerBody } from './matrix/utils/createGridInSequencerBody.js';
import { Grid } from './matrix/Grid.js';

interface NoteHandler {
  stop?: () => void;
  forceStop?: () => void;
}

export default class Sequencer {
  container: HTMLElement | null;
  config: SequencerConfig;
  context: AudioContext;
  destination: AudioNode;
  instrumentName: string;
  squelchLoadingScreen: boolean;
  colorIndex: number = 0;

  id: number = 0;
  mute: boolean = false;
  solo: boolean = false;

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
      }
    }
  }  

  collapsed: boolean = false;

  // private _activeNotes: Set<Note> = new Set();
  private _activeNoteKeys: Set<string> = new Set();
  private _noteHandlers: Map<string, NoteHandler> = new Map();
  private _beatHandler: ((beat: number) => void) | null = null;
  private _unsub: (() => void) | null = null;

  private pianoRollCanvas?: HTMLCanvasElement;
  private gridCanvas?: HTMLCanvasElement;
  private animationCanvas?: HTMLCanvasElement;
  matrix?: Grid;

  private _scheduledAnimations: ReturnType<typeof setTimeout>[] = [];
  
  private _animationLoopRunning: boolean = false;
  private _animationCursor: number = 0;

  refreshPanUI?: () => void;
  refreshVolumeUI?: () => void;
  private _volume: number = 100 / 127; // ≈ 0.7874
  private _pan: number = 0.0; // Centered by default (-1.0 = left, 1.0 = right)

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
    
      initZoomControls(this.container, () => this.matrix?.zoomIn(), () => this.matrix?.zoomOut(), () => this.matrix?.resetZoom());
    } 
  }

  private _instrument: Instrument | null = null;

  private _initCanvases(): void {
    if (!this.container) return;

    // LEGACY GRID
    // const noteCanvas = this.container.querySelector('canvas.note-grid') as HTMLCanvasElement;
    // const playheadCanvas = this.container.querySelector('canvas.playhead-canvas') as HTMLCanvasElement;
    // const scrollContainer = this.container.querySelector('#grid-scroll-container') as HTMLElement;
    // const animationCanvas = this.container.querySelector('canvas.note-animate-canvas') as HTMLCanvasElement;

    // this.grid = initGrid(noteCanvas, playheadCanvas, animationCanvas, scrollContainer, [] as Note[], this.config, this);
    // this.grid.scheduleRedraw();
    // END LEGACY GRID
  }

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

  toggleMute(): void {
    this.mute = !this.mute;
    if (this.mute) {
      this.solo = false;
    }
    this.stopScheduledNotes();
    this.updateTrackStyle();
  
    if (playbackEngine.isActive()) {
      Sequencer.rescheduleAll();
    }
  }
  
  toggleSolo(): void {
    this.solo = !this.solo;
    if (this.solo) {
      this.mute = false;
    }
    this.updateTrackStyle();
  
    if (playbackEngine.isActive()) {
      Sequencer.rescheduleAll();
    }
  }

  async preparePlayback(startAt: number, startBeat: number = 0): Promise<void> {
    if (!this.matrix) return;

    if (!this._instrument) {
      await this.initInstrument();
    }
  
    this.stopScheduledNotes();
  
    if (!this._instrument?.start) {
      console.warn(`[SEQ:${this.id}] Instrument does not support scheduled playback.`);
      return;
    }
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const notes = this.matrix.notes;
    notes.sort((a, b) => a.start - b.start);
  
    let i = 0;
    while (i < notes.length && notes[i].start < startBeat) {
      i++;
    }
  
    // Anchor wall-clock time (ms) to the same logical start point as AudioContext time (s)
    const startWallTime = performance.now(); // ms

    for (; i < notes.length; i++) {
      const note = notes[i];
      const midi = pitchToMidi(note.pitch);
      if (midi === null) continue;

      const offsetBeats = note.start - startBeat;
      const noteTime = startAt + offsetBeats * beatDuration; // seconds (AudioContext)
      const duration = note.duration * beatDuration;         // seconds
      const velocity = note.velocity ?? 100;

      try {
        console.log(`[SEQ:${this.id}] Scheduling note ${note.pitch} at ${noteTime.toFixed(3)}`);
        
        // Schedule audio playback
        this._instrument.start({
          note: midi,
          time: noteTime,
          duration,
          velocity
        });

        if (!this.collapsed) {
          // Compute corresponding wall-clock time in ms
          const wallTime = startWallTime + offsetBeats * beatDuration * 1000;
          const delay = wallTime - performance.now();

          if (delay >= 0) {
            const scheduled = setTimeout(() => {
              this.matrix?.playNoteAnimation(note);
            }, delay);
            this._scheduledAnimations.push(scheduled);
            console.log(`[SEQ:${this.id}] Scheduled animation for ${note.pitch} in ${delay.toFixed(2)} ms`);
          }
        }

      } catch (err) {
        console.warn(`[SEQ:${this.id}] Failed to schedule note`, note, err);
      }
    }

  }

  stopScheduledNotes(): void {
    if (this._instrument) {
      this._instrument.stop();
    }
  
    for (const timeoutId of this._scheduledAnimations) {
      clearTimeout(timeoutId);
    }
  
    this._scheduledAnimations = [];
  }  

  private _startAnimationLoop(): void {
    //
  }  

  resumeAnimationsFromCurrentTime(startAt: number, startBeat: number): void {
    if (!this.matrix || this.collapsed) return;
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const startWallTime = performance.now(); // anchor to wall-clock
    const offset = startAt; // seconds
  
    for (const note of this.matrix.notes) {
      const offsetBeats = note.start - startBeat;
      const wallTime = startWallTime + offsetBeats * beatDuration * 1000; // ms
      const delay = wallTime - performance.now();
  
      if (delay >= 0) {
        const timeoutId = setTimeout(() => {
          this.matrix?.playNoteAnimation(note);
        }, delay);
        this._scheduledAnimations.push(timeoutId);
      }
    }
  }  
  
  async reschedulePlayback(startAt: number, startBeat: number = 0): Promise<void> {
    if (!this.matrix) return;
  
    this.stopScheduledNotes();
  
    if (!this._instrument) {
      await this.initInstrument();
    }
  
    if (this.mute || !this.shouldPlay || !this._instrument?.start) return;
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const startWallTime = performance.now(); // anchor for wall-clock animation scheduling
  
    const nowAudio = getAudioContext().currentTime;
  
    const notes = this.matrix.notes.filter(n => n.start >= startBeat);
  
    for (const note of notes) {
      const midi = pitchToMidi(note.pitch);
      if (midi === null) continue;
  
      const offsetBeats = note.start - startBeat;
      const noteTime = startAt + offsetBeats * beatDuration; // audio time (s)
      const duration = note.duration * beatDuration;
      const velocity = note.velocity ?? 100;
  
      if (noteTime <= nowAudio + 0.01) continue; // skip notes in the immediate past
  
      try {
        console.log(`[SEQ:${this.id}] Re-scheduling note ${note.pitch} at ${noteTime.toFixed(3)}`);
        this._instrument.start({
          note: midi,
          time: noteTime,
          duration,
          velocity
        });
  
        if (!this.collapsed) {
          const wallTime = startWallTime + offsetBeats * beatDuration * 1000; // ms
          const delay = wallTime - performance.now(); // calculate live delay
  
          if (delay >= 0) {
            const timeoutId = setTimeout(() => {
              this.matrix?.playNoteAnimation(note);
            }, delay);
            this._scheduledAnimations.push(timeoutId);
          }
        }
  
      } catch (err) {
        console.warn(`[SEQ:${this.id}] Failed to re-schedule note`, note, err);
      }
    }
  }    

  async exportToOffline(signal?: AbortSignal, notesOverride?: Note[]): Promise<void> {
    const notes = notesOverride ?? this.matrix?.notes;
    if (!notes || notes.length === 0) return;
  
    const beatToSec = 60 / getTempo();
  
    if (signal?.aborted) {
      console.log('ABORTED Before loading instrument');
      return;
    }
  
    const instrument = await loadInstrument(
      this.instrumentName,
      this.context,
      this.destination,
      this._volume,
      this._pan
    );
  
    if (signal?.aborted) {
      console.log('ABORTED Right after loading instrument');
      return;
    }
  
    for (const note of notes) {
      if (signal?.aborted) {
        console.log('ABORTED During note export');
        return;
      }
  
      const rawStartSec = note.start * beatToSec;
      const startSec = Math.max(0.01, rawStartSec);
      const durationSec = note.duration * beatToSec;
      const velocity = note.velocity ?? 100;
      const midi = pitchToMidi(note.pitch);
      if (midi == null) continue;
  
      const parts = this.instrumentName.split('/');
      const library = parts.length >= 3 ? parts[1] : parts[0];
  
      const mappedNote = (library === 'drummachines' && instrument.__midiMap)
        ? instrument.__midiMap.get(midi) ?? midi
        : midi;
  
      try {
        instrument.start({
          note: mappedNote,
          duration: durationSec,
          velocity,
          time: startSec,
          loop: false,
        });
      } catch (err) {
        console.warn(`[SEQ:${this.id}] Failed to start note in export:`, note, err);
      }
    }
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
      this.context,
      this.destination,
      this.volume,
      this.pan
    );
  }

  updateTotalMeasures(): void {
    if (!this.matrix) return;
    this.matrix.setMeasures(getTotalMeasures());
  }

  // Fades the opacity of the track if muted
  updateTrackStyle(): void {
    if (!this.container) return;
  
    const muteBtn = this.container.querySelector('.mute-btn');
    const soloBtn = this.container.querySelector('.solo-btn');
    const body = this.container.querySelector('.sequencer-body');
    const contour = this.container.querySelector('.mini-contour');
  
    // Button styles
    muteBtn?.classList.toggle('bg-red-600', this.mute);
    muteBtn?.classList.toggle('bg-gray-700', !this.mute);
  
    soloBtn?.classList.toggle('bg-yellow-200', this.solo);
    soloBtn?.classList.toggle('bg-gray-700', !this.solo);
  
    const shouldFade = this.mute && !this.solo;
  
    // Fade scrollable grid area
    body?.classList.toggle('opacity-40', shouldFade);
    body?.classList.toggle('opacity-100', !shouldFade);
  
    // Fade mini contour
    contour?.classList.toggle('opacity-40', shouldFade);
    contour?.classList.toggle('opacity-100', !shouldFade);
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
    if (!this.matrix) return;

    // Validate the range
    const [lowNote, highNote] = range;
    const lowMidi = pitchToMidi(lowNote);
    const highMidi = pitchToMidi(highNote);

    if (lowMidi === null || highMidi === null) {
      console.warn(`Invalid note range: ${range}`);
      return;
    }

    if (lowMidi >= highMidi) {
      console.warn(`Invalid note range: low note must be lower than high note`);
      return;
    }

    // Update the config
    this.config.noteRange = range;
    this.config.visibleNotes = midiRangeBetween(highNote, lowNote) + 1;

    // Update canvases and redraw
    const noteCanvas = this.container?.querySelector('canvas.note-grid') as HTMLCanvasElement;
    const playheadCanvas = this.container?.querySelector('.playhead-canvas') as HTMLCanvasElement;
    const animationCanvas = this.container?.querySelector('.note-animate-canvas') as HTMLCanvasElement;
    const miniCanvas = this.container?.querySelector('.mini-contour') as HTMLCanvasElement;

    if (noteCanvas && playheadCanvas && animationCanvas) {
      const fullHeight = this.config.visibleNotes * this.config.cellHeight;
      
      // Update canvas heights
      [noteCanvas, playheadCanvas, animationCanvas].forEach(canvas => {
        canvas.height = fullHeight;
        canvas.style.height = `${fullHeight}px`;
      });

      // Redraw mini contour
      if (miniCanvas) {
        drawMiniContour(miniCanvas, this.matrix.notes, this.config, this.colorIndex);
      }

      // Trigger grid redraw
      this.redraw();
    }

    // Clamp existing notes to new range if needed
    this.matrix.notes.forEach(note => {
      const noteMidi = pitchToMidi(note.pitch);
      if (noteMidi === null) return;

      if (noteMidi < lowMidi) {
        note.pitch = lowNote;
      } else if (noteMidi > highMidi) {
        note.pitch = highNote;
      }
    });
  }

  updateToDrumNoteRange(): void {
    if (!this.instrumentName.toLowerCase().includes('drum kit')) {
      this.updateNoteRange(['C1', 'B9']);
    } else {
      this.updateNoteRange(['B1', 'A5']);
    }
  }
  
  setCollapsed(val: boolean): void {
    this.collapsed = val;
  
    if (val) {
      // Prevent animation rendering
      this.animationCanvas?.classList.add('hidden');
  
      // Cancel pending animation timeouts
      for (const timeoutId of this._scheduledAnimations) {
        clearTimeout(timeoutId);
      }
      this._scheduledAnimations = [];
  
    } else {
      this.animationCanvas?.classList.remove('hidden');
  
      // If we are playing, re-schedule animations from the current time
      if (playbackEngine.isActive()) {
        this.resumeAnimationsFromCurrentTime(
          playbackEngine.getStartTime(),
          playbackEngine.getStartBeat()
        );
      }
    }
  }  

  destroy(): void {
    this.stopScheduledNotes();
    this.container?.remove();
  }
}
