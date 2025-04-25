// js/main.js
import { setupKeyboard } from './setup/keyboard.js';
import { setupVisualizer } from './setup/visualizer.js';
import { collapseAllSequencers } from './helpers.js';
import { config, sequencers, destroyAllSequencers, setupAddTrackButton, toggleZoomControls } from './setup/sequencers.js';
import { setupUI, resetPlayButtonState } from './sequencer/ui.js';
import { initFooterUI } from './setup/footerUI.js';
import { exportSessionToJSON, exportSessionToWAV } from './export/save.js';
import { importSessionFromJSON } from './export/load.js';
import { getTotalBeats, startTransport, stopTransport, pauseTransport, resumeTransport, onTransportEnd, onBeatUpdate, getCurrentBeat, setCurrentBeat, updateTotalMeasures, updateTimeSignature, updateTempo, getTempo, getTimeSignature, getTotalMeasures } from './sequencer/transport.js';
import { setupNoteDurationButtons } from './setup/noteDurationButtons.js';
import { drawGlobalMiniContour } from './sequencer/mini-contour.js';
import { drawGlobalPlayhead, initGlobalPlayhead } from './playhead/global-playhead.js';
import { initGlobalPlayheadInteraction } from './playhead/global-playhead-interaction.js';
import { setupControlModeSwitch } from './setup/controlModeSwitch.js';
import { setupSelectModeUI } from './sequencer/grid/interaction/selectModeButtonHandlers.js';
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { recordDiff } from './appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';

onStateUpdated(resyncFromState);

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

// Create the first sequencer via diff — just like a user click
const firstId = 0;
const firstInstrument = 'fluidr3-gm/acoustic_grand_piano';
recordDiff(
  createCreateSequencerDiff(firstId, firstInstrument),
  createReverseCreateSequencerDiff(firstId)
);

// Lock in the initial application state so undo never goes before this point
recordDiff(
  createCheckpointDiff('Initial App State'),
  createReverseCheckpointDiff('Initial App State')
);

setupSelectModeUI();
refreshGlobalMiniContour();
setupAddTrackButton();
setupNoteDurationButtons();
setupControlModeSwitch();
initFooterUI();


// === UI Wiring ===
setupUI({
  getSequencers: () => sequencers,
  onPlay: () => {
    stopTransport();

    const globalEndBeat = getTotalBeats();
    const startBeat = getCurrentBeat(); // Respect current playhead location

    startTransport(getTempo(), {
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
  onTempoChange: updateTempo,
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
      const { tracks, globalConfig } = await importSessionFromJSON(file);
  
      // Update transport
      updateTempo(globalConfig.bpm);
      updateTimeSignature(globalConfig.beatsPerMeasure);
      updateTotalMeasures(globalConfig.totalMeasures);
  
      // Sync UI elements
      const tempoInput = document.getElementById('tempo-input');
      if (tempoInput) tempoInput.value = getTempo();
  
      const measuresInput = document.getElementById('measures-input');
      if (measuresInput) measuresInput.value = getTotalMeasures();
  
      // Reset app state & history
      destroyAllSequencers();
  
      // Restore sequencers via appState diff
      for (const [i, state] of tracks.entries()) {
        const id = i;
        const instrument = state.instrument || 'fluidr3-gm/acoustic_grand_piano';
        const notes = state.notes || [];
  
        recordDiff(
          {
            type: 'CREATE_SEQUENCER',
            id,
            instrument,
            notes: structuredClone(notes),
            config: state.config || {}
          },
          createReverseCreateSequencerDiff(id)
        );
      }
  
      // Lock the session state with a checkpoint
      recordDiff(
        createCheckpointDiff('Session Loaded'),
        createReverseCheckpointDiff('Session Loaded')
      );
      
      collapseAllSequencers();
      refreshGlobalMiniContour();
      setCurrentBeat(0);
      drawGlobalPlayhead(0);
    } catch (err) {
      alert('Failed to load file: ' + err.message);
    }
  },  
  onMeasuresChange: (totalMeasures) => {
    updateTotalMeasures(totalMeasures);
  
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) drawGlobalMiniContour(globalMiniCanvas, sequencers);
  },
  onBeatsPerMeasureChange: (beatsPerMeasure) => {
    updateTimeSignature(beatsPerMeasure);
  
    const globalMiniCanvas = document.getElementById('global-mini-contour');
    if (globalMiniCanvas) drawGlobalMiniContour(globalMiniCanvas, sequencers);
  }
});

