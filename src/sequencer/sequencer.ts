// src/sequencer/sequencer.ts
import { getAudioContext, getMasterGain } from '../sounds/audio/audio.js';
import { initZoomControls } from './grid/interaction/zoomControlButtonHandlers.js';
import { getTempo, getTotalMeasures } from './transport.js';
import { loadInstrument } from '../sounds/instrument-loader.js';
import { loadAndPlayNote } from '../sounds/instrument-player.js';
import { pitchToMidi, midiRangeBetween } from './matrix/utils/noteUtils.js';
import { DRUM_MIDI_TO_NAME } from '../sounds/loaders/constants/drums.js';
import { drawMiniContour } from './ui/renderers/drawMiniContour.js';
import type { Note } from './interfaces/Note.js';
import type { SequencerConfig } from './interfaces/SequencerConfig.js';
import { Instrument } from '../sounds/interfaces/Instrument.js';
import { engine as playbackEngine } from '../main.js';
import { createGridInSequencerBody } from './matrix/utils/createGridInSequencerBody.js';
import { Grid } from './matrix/Grid.js';

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

  private animationCanvas?: HTMLCanvasElement;
  matrix?: Grid;

  private _scheduledAnimations: ReturnType<typeof setTimeout>[] = [];

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
          const clampedDelay = Math.max(0, delay);
          
          const scheduled = setTimeout(() => {
            this.matrix?.playNoteAnimation(note);
          }, clampedDelay);
          this._scheduledAnimations.push(scheduled);          
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

  resumeAnimationsFromCurrentTime(startAt: number, startBeat: number): void {
    if (!this.matrix || this.collapsed) return;
  
    const bpm = getTempo();
    const beatDuration = 60 / bpm;
    const nowWall = performance.now(); // current wall-clock time (ms)
    const nowAudio = getAudioContext().currentTime; // current audio time (s)
  
    // Calculate how much real time has elapsed since playback started
    const elapsedAudioSeconds = nowAudio - startAt;
    const elapsedBeats = elapsedAudioSeconds / beatDuration;
  
    // Determine the current beat position
    const currentBeat = startBeat + elapsedBeats;
  
    const startWallTime = nowWall - elapsedBeats * beatDuration * 1000; // anchor wall time
  
    for (const note of this.matrix.notes) {
      if (note.start < currentBeat) continue; // note already passed
  
      const offsetBeats = note.start - currentBeat;
      const delay = offsetBeats * beatDuration * 1000;
  
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

    // Update mini contour
    const miniCanvas = this.container?.querySelector('.mini-contour') as HTMLCanvasElement;
    if (miniCanvas) {
      drawMiniContour(miniCanvas, this.matrix.notes, this.config, this.colorIndex);
    }

    this.matrix.setNoteRange(lowMidi, highMidi);
  }

  updateToDrumNoteRange(): void {
    if (!this.instrumentName.toLowerCase().includes('drum kit')) {
      this.updateNoteRange(['A0', 'C9']);
      this.matrix?.setCustomLabels(null);
    } else {
      this.updateNoteRange(['B1', 'A5']);
      this.matrix?.setCustomLabels(DRUM_MIDI_TO_NAME);
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
