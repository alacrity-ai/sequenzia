import { initGrid } from './initGrid.js';
import { audioCtx, masterGain } from '../audio/audio.js';
import { onBeatUpdate } from './transport.js';
import { getTotalBeats } from '../helpers.js';
import { loadInstrument } from '../sf2/sf2-loader.js';
import { loadAndPlayNote } from '../sf2/sf2-player.js';
import { pitchToMidi } from '../audio/pitch-utils.js';
import { drawMiniContour } from './mini-contour.js';

export default class Sequencer {
  constructor(containerEl, config, context = audioCtx, destination = masterGain, instrument = 'fluidr3-gm/acoustic_grand_piano') {
    this.container   = containerEl;
    this.config      = { ...config };
    this.context     = context;
    this.destination = destination;
    this.instrumentName  = instrument;
    this.notes       = [];
    this._activeNotes  = new Set();
    this._noteHandlers = new Map();
    this._beatHandler  = null;
    this._unsub        = null;

    this.isMuted   = false;
    this.isSoloed = false;

    if (this.container) {
      this.pianoRollCanvas = this.container.querySelector('.piano-roll');
      this.gridCanvas      = this.container.querySelector('.note-grid');
      this._initCanvases();
    }
  }

  async initInstrument() {
    try {
      await loadInstrument(this.instrumentName);
      console.log(`[SEQ:${this.id}] Instrument '${this.instrumentName}' loaded`);
    } catch (err) {
      console.error(`[SEQ:${this.id}] Failed to load instrument '${this.instrumentName}':`, err);
    }
  }

  updateTrackLabel() {
    const trackNameEl = this.container.querySelector('.track-name');
    if (trackNameEl) {
      trackNameEl.textContent = `${this.id + 1}: ${this.instrumentName}`;
    }
  }

  setInstrument(name) {
    this.instrumentName = name;
    this.updateTrackLabel();
    this.initInstrument(); // ✅ reload when changed
    console.log(`[SEQ:${this.id}] Instrument set to:`, name);
  }

  playNote(pitch, durationSec, velocity = 100, loop = false) {
    return loadAndPlayNote(this.instrumentName, pitch, durationSec, velocity, loop);
  }  

  _initCanvases() {
    const noteCanvas = this.container.querySelector('canvas.note-grid');
    const playheadCanvas = this.container.querySelector('canvas.playhead-canvas');
    const scrollContainer = this.container.querySelector('#grid-scroll-container');
  
    this.grid = initGrid(noteCanvas, playheadCanvas, scrollContainer, this.notes, this.config, this);
    this.grid.scheduleRedraw();
  }

  onTransportLoop() {
    this._activeNotes.clear();
  }  

  updateTotalMeasures(newTotalMeasures) {
    this.config.totalMeasures = newTotalMeasures;
    const totalBeats = getTotalBeats(this.config);
    this.clampNotesToGrid();

    const fullWidth = totalBeats * this.config.cellWidth + (this.config.labelWidth || 64);

    const noteCanvas = this.container.querySelector('canvas.note-grid');
    const playheadCanvas = this.container.querySelector('.playhead-canvas');
    const miniCanvas = this.container.querySelector('.mini-contour');

    if (noteCanvas) {
      noteCanvas.width = fullWidth;
      noteCanvas.style.width = `${fullWidth}px`;
    }

    if (playheadCanvas) {
      playheadCanvas.width = fullWidth;
      playheadCanvas.style.width = `${fullWidth}px`;
    }11

    // Always update mini contour when measures change
    if (miniCanvas) {
      drawMiniContour(miniCanvas, this.notes, this.config, this.colorIndex);
    }

    this.redraw();
  }

  clampNotesToGrid() {
    const totalBeats = getTotalBeats(this.config);

    const clamped = this.notes.filter(note => note.start < totalBeats);
    clamped.forEach(note => {
      if (note.start + note.duration > totalBeats) {
        note.duration = totalBeats - note.start;
      }
    });

    this.notes.splice(0, this.notes.length, ...clamped); // ✅ Mutate array in-place
  }

  play() {
    this.stop();
  
    this.clampNotesToGrid();
    this._activeNotes.clear();
    this._noteHandlers.clear();
  
    const bpm = this.config.bpm;
    const beatToSec = 60 / bpm;
  
    this._beatHandler = (beat) => {
      this.grid?.drawPlayhead(this.grid.getXForBeat(beat));
      if (!this.shouldPlay) return;
  
      for (const note of this.notes) {
        const noteStart = note.start;
        const noteEnd = note.start + note.duration;
  
        if (
          !this._activeNotes.has(note) &&
          noteStart <= beat &&
          beat <= noteEnd
        ) {
          const durationSec = note.duration * beatToSec;
          this.playNote(note.pitch, durationSec); // 🔁 no need to track handler
  
          this._activeNotes.add(note); // Only to prevent retriggering
        }
      }
    };
  
    this._unsub = onBeatUpdate(this._beatHandler);
    this._beatHandler(0); // ✅ force first tick
  }  

  stop() {
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
  
    this.grid?.drawPlayhead(null); // ✅ Clear playhead when stopping
  
    this.redraw();
  }
  
  pause() {
    // Stop any sounding notes but retain transport state
    for (const note of this._activeNotes) {
      const handle = this._noteHandlers.get(note);
      handle?.stop?.(); // let it decay naturally if needed
    }
  
    this._activeNotes.clear(); // allow retrigger on resume
  
    // Unsubscribe from beat updates
    if (this._unsub) {
      this._unsub();
      this._unsub = null;
    }
  
    // Do NOT clear beatHandler or noteHandlers — resume depends on it
    // Optionally: freeze playhead position
  }
  
  resume() {
    if (this._beatHandler && !this._unsub) {
      this._unsub = onBeatUpdate(this._beatHandler);
    }
  }
  

  seekTo(beat) {
    this.stop();
    this.play();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.isSoloed = false;
    this.updateTrackStyle();
  }

  toggleSolo() {
    this.isSoloed = !this.isSoloed;
    if (this.isSoloed) this.isMuted = false;
    this.updateTrackStyle();
  }

  updateTrackStyle() {
    if (!this.container) return;
    const muteBtn = this.container.querySelector('.mute-btn');
    const soloBtn = this.container.querySelector('.solo-btn');
    muteBtn.classList.toggle('bg-red-600', this.isMuted);
    muteBtn.classList.toggle('bg-gray-700', !this.isMuted);
    soloBtn.classList.toggle('bg-yellow-200', this.isSoloed);
    soloBtn.classList.toggle('bg-gray-700', !this.isSoloed);
    this.container.classList.toggle('opacity-40', this.isMuted && !this.isSoloed);
    this.container.classList.toggle('opacity-100', !(this.isMuted && !this.isSoloed));
  }

  updateNotesFromTrackMap(trackMap) {
    this.notes.splice(0, this.notes.length, ...trackMap.n.map(([pitch, start, duration]) => ({
      pitch,
      start,
      duration
    })));
  }  

  redraw() {
    this.grid?.scheduleRedraw();
  }

  destroy() {
    this.stop();
    this.container?.remove();
  }

  getState() {
    return {
      notes: [...this.notes],
      config: { ...this.config },
      instrument: this.instrumentName
    };
  }
  
  setState({ notes, config, instrument }) {
    this.notes.length = 0;
    this.notes.push(...notes);
    Object.assign(this.config, config);
  
    if (instrument) {
      this.instrumentName = instrument;
    }
  
    this.redraw();
  }
  
  async exportToOffline() {
    const beatToSec = 60 / this.config.bpm;
  
    // 🛠 Ensure instrument is loaded into the correct context
    const instrument = await loadInstrument(this.instrumentName, this.context, this.destination);
  
    for (const note of this.notes) {
      const startSec = note.start * beatToSec;
      const durationSec = note.duration * beatToSec;
  
      instrument.start({
        note: pitchToMidi(note.pitch),
        duration: durationSec,
        velocity: 100,
        time: startSec,
        loop: false,
      });
    }
  }
}
