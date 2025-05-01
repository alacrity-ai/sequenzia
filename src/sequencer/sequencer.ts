// src/sequencer/sequencer.ts
import { initGrid } from './initGrid.js';
import { getAudioContext, getMasterGain } from '../sounds/audio/audio.js';
import { animateNotePlay } from './grid/animation/notePlayAnimation.js';
import { getTempo, getTotalBeats } from './transport.js';
import { loadInstrument } from '../sounds/instrument-loader.js';
import { loadAndPlayNote } from '../sounds/instrument-player.js'; // Changed from sf2-player.js
import { pitchToMidi } from '../sounds/audio/pitch-utils.js';
import { drawMiniContour } from './grid/drawing/mini-contour.js';
import { labelWidth } from './grid/helpers/constants.js';
import type { Note } from './interfaces/Note.js';
import type { Grid } from './interfaces/Grid.js';
import type { GridConfig } from './interfaces/GridConfig.js';
import { midiRangeBetween } from './grid/helpers/note-finder.js';
import { Instrument } from '../sounds/interfaces/Instrument.js';
import { HandlerContext as GridContext } from './interfaces/HandlerContext.js';
import { engine as playbackEngine } from '../main.js';

interface NoteHandler {
  stop?: () => void;
  forceStop?: () => void;
}

export default class Sequencer {
  container: HTMLElement | null;
  config: GridConfig;
  context: AudioContext;
  destination: AudioNode;
  instrumentName: string;
  squelchLoadingScreen: boolean;
  notes: Note[] = [];
  colorIndex: number = 0;

  id: number = 0;
  mute: boolean = false;
  solo: boolean = false;
  shouldPlay: boolean = true;

  collapsed: boolean = false;

  // private _activeNotes: Set<Note> = new Set();
  private _activeNoteKeys: Set<string> = new Set();
  private _noteHandlers: Map<string, NoteHandler> = new Map();
  private _beatHandler: ((beat: number) => void) | null = null;
  private _unsub: (() => void) | null = null;

  private pianoRollCanvas?: HTMLCanvasElement;
  private gridCanvas?: HTMLCanvasElement;
  private animationCanvas?: HTMLCanvasElement;
  grid?: Grid;

  private _scheduledAnimations: {
    time: number;
    note: Note;
    context: GridContext;
  }[] = [];
  
  private _animationLoopRunning: boolean = false;
  private _animationCursor: number = 0;

  refreshPanUI?: () => void;
  refreshVolumeUI?: () => void;
  private _volume: number = 100 / 127; // ≈ 0.7874
  private _pan: number = 0.0; // Centered by default (-1.0 = left, 1.0 = right)

  constructor(
    containerEl: HTMLElement | null,
    config: GridConfig,
    context: AudioContext = getAudioContext(),
    destination: AudioNode = getMasterGain(),
    instrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano',
    squelchLoadingScreen: boolean = false
  ) {
    this.container = containerEl;
    this.config = { ...config };
    this.context = context;
    this.destination = destination;
    this.instrumentName = instrument;
    this.squelchLoadingScreen = squelchLoadingScreen;

    if (this.container) {
      this.pianoRollCanvas = this.container.querySelector('.piano-roll') as HTMLCanvasElement;
      this.gridCanvas = this.container.querySelector('.note-grid') as HTMLCanvasElement;
      this.animationCanvas = this.container.querySelector('.note-animate-canvas') as HTMLCanvasElement;
      this._initCanvases();
    }
  }

  private _instrument: Instrument | null = null;

  private _initCanvases(): void {
    if (!this.container) return;
    const noteCanvas = this.container.querySelector('canvas.note-grid') as HTMLCanvasElement;
    const playheadCanvas = this.container.querySelector('canvas.playhead-canvas') as HTMLCanvasElement;
    const scrollContainer = this.container.querySelector('#grid-scroll-container') as HTMLElement;
    const animationCanvas = this.container.querySelector('canvas.note-animate-canvas') as HTMLCanvasElement;

    this.grid = initGrid(noteCanvas, playheadCanvas, animationCanvas, scrollContainer, this.notes, this.config, this);
    this.grid.scheduleRedraw();
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

  toggleMute(): void {
    this.mute = !this.mute;
    if (this.mute) this.solo = false;
    this.updateTrackStyle();
  }

  toggleSolo(): void {
    this.solo = !this.solo;
    if (this.solo) this.mute = false;
    this.updateTrackStyle();
  }

  async preparePlayback(startAt: number, startBeat: number = 0): Promise<void> {
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
    const notes = this.notes;
    notes.sort((a, b) => a.start - b.start);
  
    let i = 0;
    while (i < notes.length && notes[i].start < startBeat) {
      i++;
    }
  
    for (; i < notes.length; i++) {
      const note = notes[i];
      const midi = pitchToMidi(note.pitch);
      if (midi === null) continue;
  
      const noteTime = startAt + (note.start - startBeat) * beatDuration;
      const duration = note.duration * beatDuration;
      const velocity = note.velocity ?? 100;
  
      try {
        this._instrument.start({
          note: midi,
          time: noteTime,
          duration,
          velocity
        });
  
        // Schedule note animation
        if (!this.collapsed && this.grid?.gridContext?.animationCtx) {
          this._scheduledAnimations.push({
            time: noteTime,
            note,
            context: this.grid.gridContext
          });
        
          this._startAnimationLoop(); // ensures this instance animates
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
  
    this._scheduledAnimations = [];
    this._animationCursor = 0;
    this._animationLoopRunning = false;      
  }

  private _startAnimationLoop(): void {
    if (this._animationLoopRunning) return;
    this._animationLoopRunning = true;
  
    const loop = () => {
      const now = getAudioContext().currentTime;
      const lookahead = 0.05;
      const len = this._scheduledAnimations.length;
  
      while (
        this._animationCursor < len &&
        this._scheduledAnimations[this._animationCursor].time < now + lookahead
      ) {
        const { note, context } = this._scheduledAnimations[this._animationCursor++];

        animateNotePlay(context, note, {
          getPitchRow: context.getPitchRow,
          cellWidth: context.getCellWidth(),
          cellHeight: context.getCellHeight(),
          labelWidth
        });
      }
  
      if (this._animationCursor >= len) {
        this._scheduledAnimations = [];
        this._animationCursor = 0;
        this._animationLoopRunning = false;
      } else {
        requestAnimationFrame(loop);
      }
    };
  
    requestAnimationFrame(loop);
  }  

  resumeAnimationsFromCurrentTime(startAt: number, startBeat: number): void {
    if (!this.grid?.gridContext || this.collapsed) return;
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const now = getAudioContext().currentTime;
  
    for (const note of this.notes) {
      const noteTime = startAt + (note.start - startBeat) * beatDuration;
  
      if (noteTime >= now) {
        this._scheduledAnimations.push({
          time: noteTime,
          note,
          context: this.grid.gridContext
        });
      }
    }
  
    this._scheduledAnimations.sort((a, b) => a.time - b.time);
    this._startAnimationLoop();
  }  

  async reschedulePlayback(startAt: number, startBeat: number = 0): Promise<void> {
    // Stop all currently scheduled notes and animations
    this.stopScheduledNotes();
  
    // Reinitialize the instrument if needed (should be fast if cached)
    if (!this._instrument) {
      await this.initInstrument();
    }
  
    // Skip re-scheduling if muted or shouldn't play
    if (this.mute || !this.shouldPlay || !this._instrument?.start) return;
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const now = getAudioContext().currentTime;
  
    // Re-schedule notes and animations from current beat
    const notes = this.notes.filter(n => n.start >= startBeat);
    for (const note of notes) {
      const midi = pitchToMidi(note.pitch);
      if (midi === null) continue;
  
      const noteTime = startAt + (note.start - startBeat) * beatDuration;
      const duration = note.duration * beatDuration;
      const velocity = note.velocity ?? 100;
  
      try {
        this._instrument.start({
          note: midi,
          time: noteTime,
          duration,
          velocity
        });
  
        // Schedule animation
        if (!this.collapsed && this.grid?.gridContext?.animationCtx && noteTime >= now) {
          this._scheduledAnimations.push({
            time: noteTime,
            note,
            context: this.grid.gridContext
          });
  
          this._startAnimationLoop();
        }
  
      } catch (err) {
        console.warn(`[SEQ:${this.id}] Failed to re-schedule note`, note, err);
      }
    }
  }
  

  async exportToOffline(signal?: AbortSignal): Promise<void> {
    const beatToSec = 60 / getTempo();
  
    // Check if operation was cancelled before even loading the instrument
    if (signal?.aborted) return;
  
    const instrument = await loadInstrument(
      this.instrumentName,
      this.context,
      this.destination,
      this._volume,
      this._pan
    );
  
    // Abort right after loading, if triggered
    if (signal?.aborted) return;
  
    for (const note of this.notes) {
      if (signal?.aborted) return;
  
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
          velocity: velocity,
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
    const totalBeats = getTotalBeats();
    this.clampNotesToGrid();

    const fullWidth = totalBeats * this.config.cellWidth + (labelWidth || 64);

    const noteCanvas = this.container?.querySelector('canvas.note-grid') as HTMLCanvasElement;
    const playheadCanvas = this.container?.querySelector('.playhead-canvas') as HTMLCanvasElement;
    const miniCanvas = this.container?.querySelector('.mini-contour') as HTMLCanvasElement;

    if (noteCanvas) {
      noteCanvas.width = fullWidth;
      noteCanvas.style.width = `${fullWidth}px`;
    }

    if (playheadCanvas) {
      playheadCanvas.width = fullWidth;
      playheadCanvas.style.width = `${fullWidth}px`;
    }

    if (miniCanvas) {
      drawMiniContour(miniCanvas, this.notes, this.config, this.colorIndex);
    }

    this.redraw();
  }

  clampNotesToGrid(): void {
    const totalBeats = getTotalBeats();
    const clamped = this.notes.filter(note => note.start < totalBeats);
    clamped.forEach(note => {
      if (note.start + note.duration > totalBeats) {
        note.duration = totalBeats - note.start;
      }
    });
    this.notes.splice(0, this.notes.length, ...clamped);
  }

  updateTrackStyle(): void {
    if (!this.container) return;
    const muteBtn = this.container.querySelector('.mute-btn');
    const soloBtn = this.container.querySelector('.solo-btn');
    muteBtn?.classList.toggle('bg-red-600', this.mute);
    muteBtn?.classList.toggle('bg-gray-700', !this.mute);
    soloBtn?.classList.toggle('bg-yellow-200', this.solo);
    soloBtn?.classList.toggle('bg-gray-700', !this.solo);
    this.container.classList.toggle('opacity-40', this.mute && !this.solo);
    this.container.classList.toggle('opacity-100', !(this.mute && !this.solo));
  }

  redraw(): void {
    this.grid?.scheduleRedraw();
  }

  getState(): { notes: Note[]; config: GridConfig; instrument: string } {
    return {
      notes: [...this.notes],
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
    config: Partial<GridConfig>;
    instrument?: string;
    volume?: number;
    pan?: number;
  }): void {
    // Replace note array efficiently
    this.notes.length = 0;
    this.notes.push(...notes);
  
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
    this.notes.splice(
      0,
      this.notes.length,
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
        drawMiniContour(miniCanvas, this.notes, this.config, this.colorIndex);
      }

      // Trigger grid redraw
      this.redraw();
    }

    // Clamp existing notes to new range if needed
    this.notes.forEach(note => {
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
      this._scheduledAnimations = [];
      this._animationCursor = 0;
      this._animationLoopRunning = false;
  
      // Hide canvas element
      this.animationCanvas?.classList.add('hidden');
  
      // Disable drawing context
      if (this.grid?.gridContext) {
        this.grid.gridContext.animationCtx = null; // <-- requires nullable typing
      }
  
    } else {
      this.animationCanvas?.classList.remove('hidden');
    
      if (this.animationCanvas && this.grid?.gridContext) {
        this.grid.gridContext.animationCtx = this.animationCanvas.getContext('2d');
      }
    
      // Attempt to resume animation from current playback position
      if (playbackEngine.isActive()) {
        this.resumeAnimationsFromCurrentTime(playbackEngine.getStartTime(), playbackEngine.getStartBeat());
      }
    }    
  }  

  destroy(): void {
    this.stopScheduledNotes();
    this.container?.remove();
  }
}
