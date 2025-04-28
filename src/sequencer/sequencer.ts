// src/sequencer/sequencer.ts
import { initGrid } from './initGrid.js';
import { audioCtx, masterGain } from '../audio/audio.js';
import { onBeatUpdate, getTempo, getTotalBeats } from './transport.js';
import { loadInstrument } from '../sf2/sf2-loader.js';
import { loadAndPlayNote } from '../sf2/sf2-player.js';
import { pitchToMidi } from '../audio/pitch-utils.js';
import { drawMiniContour } from './grid/drawing/mini-contour.js';
import { animateNotePlay } from './grid/animation/notePlayAnimation.js';
import { labelWidth } from './grid/helpers/constants.js';
import type { Note } from './interfaces/Note.js';
import type { Grid } from './interfaces/Grid.js';
import type { GridConfig } from './interfaces/GridConfig.js';

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

  constructor(
    containerEl: HTMLElement | null,
    config: GridConfig,
    context: AudioContext = audioCtx,
    destination: AudioNode = masterGain,
    instrument: string = 'fluidr3-gm/acoustic_grand_piano'
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
      await loadInstrument(this.instrumentName);
      console.log(`[SEQ:${this.id}] Instrument '${this.instrumentName}' loaded`);
    } catch (err) {
      console.error(`[SEQ:${this.id}] Failed to load instrument '${this.instrumentName}':`, err);
    }
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
      if (this.instrumentName.startsWith('drummachines/') && instrument.__midiMap) {
        const sampleName = instrument.__midiMap.get(midi);
        if (sampleName) {
          instrument.start({
            note: sampleName,  // Use sample name instead of MIDI note
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
}
