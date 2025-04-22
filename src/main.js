// js/main.js
import { setupKeyboard } from './setup/keyboard.js';
import { setupVisualizer } from './setup/visualizer.js';
import { config, sequencers, createSequencer, destroyAllSequencers, setupAddTrackButton, toggleZoomControls } from './setup/sequencers.js';
import { setupUI, resetPlayButtonState } from './sequencer/ui.js';
import { exportSessionToJSON, exportSessionToWAV } from './export/save.js';
import { importFromJSON, importSessionFromJSON } from './export/load.js';
import { startTransport, stopTransport, pauseTransport, resumeTransport, onTransportEnd, onBeatUpdate, getCurrentBeat, setCurrentBeat } from './sequencer/transport.js';
import { setupNoteDurationButtons } from './setup/noteDurationButtons.js';
import { drawGlobalMiniContour } from './sequencer/mini-contour.js';
import { getTotalBeats } from './helpers.js';
import { drawGlobalPlayhead, initGlobalPlayhead } from './playhead/global-playhead.js';
import { initGlobalPlayheadInteraction } from './playhead/global-playhead-interaction.js';
import { setupControlModeSwitch } from './setup/controlModeSwitch.js';
import { setupSelectModeUI } from './sequencer/grid/interaction/select-mode-ui.js';

function refreshGlobalMiniContour() {
  drawGlobalMiniContour(globalMiniCanvas, sequencers);
}  

// === Playhead ===
const globalMiniCanvas = document.getElementById('global-mini-contour');
const globalPlayheadCanvas = document.getElementById('global-mini-playhead');
initGlobalPlayhead(globalPlayheadCanvas);
initGlobalPlayheadInteraction(globalPlayheadCanvas, config);
drawGlobalPlayhead(0);

// === INIT ALL COMPONENTS ===
const pianoCanvas = document.getElementById('piano');
setupKeyboard(pianoCanvas);
const waveform = document.getElementById('waveform');
const visualizer = setupVisualizer(waveform, document.getElementById('visualizer-mode'));
// Creat the first sequencer
const { seq: firstSeq, wrapper: firstSeqWrapper } = createSequencer();
toggleZoomControls(firstSeqWrapper, true);

setupSelectModeUI();
refreshGlobalMiniContour();
setupAddTrackButton();
setupNoteDurationButtons();
setupControlModeSwitch();

// === UI Wiring ===
setupUI({
  getSequencers: () => sequencers,
  onPlay: () => {
    stopTransport();

    const globalEndBeat = getTotalBeats(config);
    const startBeat = getCurrentBeat(); // Respect current playhead location

    startTransport(config.bpm, {
      loop: config.loopEnabled,
      endBeat: globalEndBeat,
      startBeat,
      onLoop: () => {
        // ✅ Clear all active notes on loop
        sequencers.forEach(seq => seq.onTransportLoop?.());
      }
    });

    // Redraw the global playhead on each beat
    onBeatUpdate(beat => {
      const x = (beat / globalEndBeat) * globalPlayheadCanvas.width;
      drawGlobalPlayhead(x);
    });

    // Start all sequencers
    sequencers.forEach(s => s.play());

    // Reset the play button UI when transport ends
    onTransportEnd(() => {
      resetPlayButtonState();
      setCurrentBeat(0);
      drawGlobalPlayhead(0);
    });
  },
  onPause: () => {
    pauseTransport();
    sequencers.forEach(s => s.pause());
  },
  onResume: () => {
    resumeTransport();
    sequencers.forEach(s => s.resume());
  },
  onStop: () => {
    stopTransport();
    setCurrentBeat(0);
    sequencers.forEach(s => s.stop());
    drawGlobalPlayhead(0);
  },
  onDurationChange: val => {
    config.currentDuration = val;
    sequencers.forEach(s => (s.config.currentDuration = val));
  },
  onSnapChange: val => {
    config.snapResolution = val;
    sequencers.forEach(s => (s.config.snapResolution = val));
  },
  onToggleLoop: enabled => {
    config.loopEnabled = enabled;
    sequencers.forEach(s => (s.config.loopEnabled = enabled));
  },
  onTempoChange: val => {
    config.bpm = val;
    sequencers.forEach(s => (s.config.bpm = val));
  },
  onTemperamentToggle: isEqual => {
    config.useEqualTemperament = isEqual;
    sequencers.forEach(s => (s.config.useEqualTemperament = isEqual));
  },
  onSave: async (format) => {
    const states = sequencers.map(s => s.getState());

    if (format === 'json') {
      const { url, filename } = exportSessionToJSON(states);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'wav') {
      await exportSessionToWAV(states); // 👈 async export
    } else if (format === 'midi') {
      alert("MIDI export not implemented yet.");
    }
  },
  onLoad: async file => {
    try {
      let tracks = [];
      try {
        tracks = await importSessionFromJSON(file);
      } catch {
        tracks = await importFromJSON(file);
      }

      // Extract global settings from first track and apply globally
      if (tracks.length > 0) {
        const firstTrackConfig = tracks[0].config;
        
        // Update BPM
        config.bpm = firstTrackConfig.bpm ?? config.bpm;
        const tempoInput = document.getElementById('tempo-input');
        if (tempoInput) tempoInput.value = config.bpm;

        // Update measure settings
        config.beatsPerMeasure = firstTrackConfig.beatsPerMeasure ?? config.beatsPerMeasure;
        config.totalMeasures = firstTrackConfig.totalMeasures ?? config.totalMeasures;
        
        // Update measures input if it exists
        const measuresInput = document.getElementById('measures-input');
        if (measuresInput) measuresInput.value = config.totalMeasures;
      }

      destroyAllSequencers();

      tracks.forEach(state => {
        const { seq, wrapper } = createSequencer(state);
        const body = wrapper.querySelector('.sequencer-body');
        const mini = wrapper.querySelector('canvas.mini-contour');
        const collapseBtn = wrapper.querySelector('.collapse-btn');
        body.classList.add('hidden');
        mini.classList.remove('hidden');
        collapseBtn.textContent = '⯅';
      });
      refreshGlobalMiniContour();
      setCurrentBeat(0);
      drawGlobalPlayhead(0);
    } catch (err) {
      alert('Failed to load file: ' + err.message);
    }
  },
  onMeasuresChange: (totalMeasures) => {
    config.totalMeasures = totalMeasures;
    sequencers.forEach(seq => {
      seq.updateTotalMeasures(totalMeasures);
    });
  
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) drawGlobalMiniContour(globalMiniCanvas, sequencers);
  },
  onBeatsPerMeasureChange: (beatsPerMeasure) => {
    config.beatsPerMeasure = beatsPerMeasure;
    sequencers.forEach(seq => {
      seq.config.beatsPerMeasure = beatsPerMeasure;
      seq.updateTotalMeasures(config.totalMeasures); // This will recalculate total beats
    });
    
    // Redraw global mini contour since total beats changed
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) drawGlobalMiniContour(globalMiniCanvas, sequencers);
  }
});

