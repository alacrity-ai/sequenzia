// src/main.ts

import { setupKeyboard } from './setup/keyboard.js';
import { setupVisualizer } from './setup/visualizer.js';
import { collapseAllSequencers } from './helpers.js';
import { sequencers, destroyAllSequencers, setupAddTrackButton, toggleZoomControls } from './setup/sequencers.js';
import { GRID_CONFIG as config } from './sequencer/grid/helpers/constants.js';
import { setupUI, resetPlayButtonState } from './sequencer/ui.js';
import { initFooterUI } from './setup/footerUI.js';
import { exportSessionToJSON, exportSessionToWAV } from './export/save.js';
import { importSessionFromJSON } from './export/load.js';
import { getTotalBeats, startTransport, stopTransport, pauseTransport, resumeTransport, onTransportEnd, onBeatUpdate, getCurrentBeat, setCurrentBeat, updateTotalMeasures, updateTimeSignature, updateTempo, getTempo, getTimeSignature, getTotalMeasures } from './sequencer/transport.js';
import { setupNoteDurationButtons } from './setup/noteDurationButtons.js';
import { drawGlobalMiniContour } from './sequencer/grid/drawing/mini-contour.js';
import { drawGlobalPlayhead, initGlobalPlayhead } from './playhead/global-playhead.js';
import { initGlobalPlayheadInteraction } from './playhead/global-playhead-interaction.js';
import { setupControlModeSwitch } from './setup/controlModeSwitch.js';
import { setupSelectModeUI } from './sequencer/grid/interaction/selectModeButtonHandlers.js';
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { getAppState, recordDiff } from './appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';

onStateUpdated(resyncFromState);

function refreshGlobalMiniContour(): void {
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;
  if (canvas) drawGlobalMiniContour(canvas, sequencers);
}

// === Playhead ===
const globalMiniCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;
const globalPlayheadCanvas = document.getElementById('global-mini-playhead') as HTMLCanvasElement;
initGlobalPlayhead(globalPlayheadCanvas);
initGlobalPlayheadInteraction(globalPlayheadCanvas, config);
drawGlobalPlayhead(0);

// === INIT ALL COMPONENTS ===
const pianoCanvas = document.getElementById('piano') as HTMLCanvasElement;
setupKeyboard(pianoCanvas);

const waveform = document.getElementById('waveform') as HTMLCanvasElement;
const visualizerMode = document.getElementById('visualizer-mode') as HTMLElement;
const visualizer = setupVisualizer(waveform, visualizerMode);

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
    const startBeat = getCurrentBeat();

    startTransport(getTempo(), {
      loop: config.loopEnabled,
      endBeat: globalEndBeat,
      startBeat,
      onLoop: () => {
        sequencers.forEach(seq => seq.onTransportLoop?.());
      }
    });

    onBeatUpdate((beat: number) => {
      const x = (beat / globalEndBeat) * globalPlayheadCanvas.width;
      drawGlobalPlayhead(x);
    });

    sequencers.forEach(seq => seq.play());

    onTransportEnd(() => {
      resetPlayButtonState();
      setCurrentBeat(0);
      drawGlobalPlayhead(0);
    });
  },
  onPause: () => {
    pauseTransport();
    sequencers.forEach(seq => seq.pause());
  },
  onResume: () => {
    resumeTransport();
    sequencers.forEach(seq => seq.resume());
  },
  onStop: () => {
    stopTransport();
    setCurrentBeat(0);
    sequencers.forEach(seq => seq.stop());
    drawGlobalPlayhead(0);
  },
  onDurationChange: (val: number) => {
    config.currentDuration = val;
    sequencers.forEach(seq => (seq.config.currentDuration = val));
  },
  onSnapChange: (val: number) => {
    config.snapResolution = val;
    sequencers.forEach(seq => (seq.config.snapResolution = val));
  },
  onToggleLoop: (enabled: boolean) => {
    config.loopEnabled = enabled;
    sequencers.forEach(seq => (seq.config.loopEnabled = enabled));
  },
  onTempoChange: (tempo: number) => {
    updateTempo(tempo);
  },
  onSave: async (format: string) => {
    const appState = getAppState(); // ✅
  
    if (format === 'json') {
      const { url, filename } = exportSessionToJSON(appState);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'wav') {
      const session = {
        globalConfig: {
          bpm: appState.tempo,
          beatsPerMeasure: appState.timeSignature[0],
          totalMeasures: appState.totalMeasures
        },
        tracks: sequencers.map(seq => ({
          notes: seq.notes,
          instrument: seq.instrumentName,
          config: seq.config // Pull config from live sequencer
        }))
      };
      await exportSessionToWAV(session);
    } else if (format === 'midi') {
      alert("MIDI export not implemented yet.");
    }
  },  
  onLoad: async (file: File) => {
    try {
      const { tracks, globalConfig } = await importSessionFromJSON(file);

      updateTempo(globalConfig.bpm);
      updateTimeSignature(globalConfig.beatsPerMeasure);
      updateTotalMeasures(globalConfig.totalMeasures);

      const tempoInput = document.getElementById('tempo-input') as HTMLInputElement | null;
      if (tempoInput) tempoInput.value = String(getTempo());

      const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
      if (measuresInput) measuresInput.value = String(getTotalMeasures());

      destroyAllSequencers();

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

      recordDiff(
        createCheckpointDiff('Session Loaded'),
        createReverseCheckpointDiff('Session Loaded')
      );

      collapseAllSequencers();
      refreshGlobalMiniContour();
      setCurrentBeat(0);
      drawGlobalPlayhead(0);
    } catch (err) {
      if (err instanceof Error) {
        alert('Failed to load file: ' + err.message);
      } else {
        alert('Failed to load file: Unknown error');
      }
    }
  },
  onMeasuresChange: (totalMeasures: number) => {
    updateTotalMeasures(totalMeasures);

    const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
    if (canvas) drawGlobalMiniContour(canvas, sequencers);
  },
  onBeatsPerMeasureChange: (beatsPerMeasure: number) => {
    updateTimeSignature(beatsPerMeasure);

    const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
    if (canvas) drawGlobalMiniContour(canvas, sequencers);
  }
});
