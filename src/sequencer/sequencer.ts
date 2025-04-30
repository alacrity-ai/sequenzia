// src/sequencer/sequencer.ts
import { initGrid } from './initGrid.js';
import { getAudioContext, getMasterGain } from '../audio/audio.js';
import { onBeatUpdate, getTempo, getTotalBeats } from './transport.js';
import { loadInstrument } from '../sounds/instrument-loader.js';
import { loadAndPlayNote } from '../sounds/instrument-player.js'; // Changed from sf2-player.js
import { pitchToMidi } from '../audio/pitch-utils.js';
import { drawMiniContour } from './grid/drawing/mini-contour.js';
import { animateNotePlay } from './grid/animation/notePlayAnimation.js';
import { labelWidth } from './grid/helpers/constants.js';
import type { Note } from './interfaces/Note.js';
import type { Grid } from './interfaces/Grid.js';
import type { GridConfig } from './interfaces/GridConfig.js';
import { midiRangeBetween } from './grid/helpers/note-finder.js';

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
  notes: Note[] = [];
  colorIndex: number = 0;

  id: number = 0;
  mute: boolean = false;
  solo: boolean = false;
  shouldPlay: boolean = true;

  private _activeNotes: Set<Note> = new Set();
  private _noteHandlers: Map<Note, NoteHandler> = new Map();
  private _beatHandler: ((beat: number) => void) | null = null;
  private _unsub: (() => void) | null = null;

  private pianoRollCanvas?: HTMLCanvasElement;
  private gridCanvas?: HTMLCanvasElement;
  private animationCanvas?: HTMLCanvasElement;
  grid?: Grid;

  private _volume: number = 1.0;

  constructor(
    containerEl: HTMLElement | null,
    config: GridConfig,
    context: AudioContext = getAudioContext(),
    destination: AudioNode = getMasterGain(),
    instrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano'
  ) {
    this.container = containerEl;
    this.config = { ...config };
    this.context = context;
    this.destination = destination;
    this.instrumentName = instrument;

    if (this.container) {
      this.pianoRollCanvas = this.container.querySelector('.piano-roll') as HTMLCanvasElement;
      this.gridCanvas = this.container.querySelector('.note-grid') as HTMLCanvasElement;
      this.animationCanvas = this.container.querySelector('.note-animate-canvas') as HTMLCanvasElement;
      this._initCanvases();
    }
  }

  async initInstrument(): Promise<void> {
    try {
      loadInstrument(this.instrumentName, this.context, this.destination);
      this.updateToDrumNoteRange();
      console.log(`[SEQ:${this.id}] Instrument '${this.instrumentName}' loaded`);
    } catch (err) {
      console.error(`[SEQ:${this.id}] Failed to load instrument '${this.instrumentName}':`, err);
    }
  }

  /** Getter for current track volume (0.0–1.0) */
  get volume(): number {
    return this._volume;
  }

  /** Setter for volume — will apply to gain node when implemented */
  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val)); // Clamp to [0, 1]
    
    // TODO: apply to actual instrument
  }

  updateTrackLabel(): void {
    const trackNameEl = this.container?.querySelector('.track-name');
    if (trackNameEl) {
      trackNameEl.textContent = `${this.id + 1}: ${this.instrumentName}`;
    }
  }

  setInstrument(name: string): void {
    this.instrumentName = name;
    this.updateTrackLabel();
    this.initInstrument();
  }

  playNote(pitch: string, durationSec: number, velocity = 100, loop = false): Promise<null> {
    return loadAndPlayNote(this.instrumentName, pitch, durationSec, velocity, loop);
  }  

  private _initCanvases(): void {
    if (!this.container) return;
    const noteCanvas = this.container.querySelector('canvas.note-grid') as HTMLCanvasElement;
    const playheadCanvas = this.container.querySelector('canvas.playhead-canvas') as HTMLCanvasElement;
    const scrollContainer = this.container.querySelector('#grid-scroll-container') as HTMLElement;
    const animationCanvas = this.container.querySelector('canvas.note-animate-canvas') as HTMLCanvasElement;

    this.grid = initGrid(noteCanvas, playheadCanvas, animationCanvas, scrollContainer, this.notes, this.config, this);
    this.grid.scheduleRedraw();
  }

  onTransportLoop(): void {
    this._activeNotes.clear();
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

  play(): void {
    this.stop();
    this.clampNotesToGrid();
    this._activeNotes.clear();
    this._noteHandlers.clear();

    const bpm = getTempo();
    const beatToSec = 60 / bpm;

    this._beatHandler = (beat) => {
      this.grid?.drawPlayhead(this.grid.getXForBeat(beat));
      if (!this.shouldPlay) return;

      for (const note of this.notes) {
        const noteStart = note.start;
        const noteEnd = note.start + note.duration;
        if (!this._activeNotes.has(note) && noteStart <= beat && beat <= noteEnd) {
          const durationSec = note.duration * beatToSec;
          this.playNote(note.pitch, durationSec);

          if (this.grid?.gridContext) {
            const gctx = this.grid.gridContext;
            animateNotePlay(gctx, note, {
              getPitchRow: gctx.getPitchRow,
              cellWidth: gctx.getCellWidth(),
              cellHeight: gctx.getCellHeight(),
              labelWidth
            });
          }

          this._activeNotes.add(note);
        }
      }
    };

    this._unsub = onBeatUpdate(this._beatHandler);
    this._beatHandler(0);
  }

  stop(): void {
    if (this._unsub) {
      this._unsub();
      this._unsub = null;
    }
    this._beatHandler = null;

    for (const note of this._activeNotes) {
      const handle = this._noteHandlers.get(note);
      handle?.forceStop?.();
      handle?.stop?.();
    }

    this._activeNotes.clear();
    this._noteHandlers.clear();

    this.grid?.drawPlayhead(0);
    this.redraw();
  }

  pause(): void {
    for (const note of this._activeNotes) {
      const handle = this._noteHandlers.get(note);
      handle?.stop?.();
    }
    this._activeNotes.clear();

    if (this._unsub) {
      this._unsub();
      this._unsub = null;
    }
  }

  resume(): void {
    if (this._beatHandler && !this._unsub) {
      this._unsub = onBeatUpdate(this._beatHandler);
    }
  }

  seekTo(beat: number): void {
    this.stop();
    this.play();
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

  destroy(): void {
    this.stop();
    this.container?.remove();
  }

  getState(): { notes: Note[]; config: GridConfig; instrument: string } {
    return {
      notes: [...this.notes],
      config: { ...this.config },
      instrument: this.instrumentName
    };
  }

  setState({ notes, config, instrument }: { notes: Note[]; config: Partial<GridConfig>; instrument?: string }): void {
    this.notes.length = 0;
    this.notes.push(...notes);
    Object.assign(this.config, config);
    if (instrument) {
      this.instrumentName = instrument;
    }
    this.redraw();
  }

  updateNotesFromTrackMap(trackMap: { n: [string, number, number][] }): void {
    this.notes.splice(0, this.notes.length, ...trackMap.n.map(([pitch, start, duration]) => ({
      pitch,
      start,
      duration
    })));
  }  

  async exportToOffline(): Promise<void> {
    const beatToSec = 60 / getTempo();
    const instrument = await loadInstrument(this.instrumentName, this.context, this.destination);

    for (const note of this.notes) {
      const startSec = note.start * beatToSec;
      const durationSec = note.duration * beatToSec;
      const midi = pitchToMidi(note.pitch);
      if (midi == null) continue;

      // Add check for drum machines and use sample names
      const parts = this.instrumentName.split('/');
      const library = parts.length >= 3 ? parts[1] : parts[0];
      
      if (library === 'drummachines' && instrument.__midiMap) {
        const sampleName = instrument.__midiMap.get(midi);
        if (sampleName) {
          instrument.start({
            note: sampleName,
            duration: durationSec,
            velocity: 100,
            time: startSec,
            loop: false,
          });
        }
      } else {
        instrument.start({
          note: midi,
          duration: durationSec,
          velocity: 100,
          time: startSec,
          loop: false,
        });
      }      
    }
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
}
