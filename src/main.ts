// src/main.ts
import { hideSplashScreen } from './global/splashscreen.js';
import { setupHeaderModeToggler } from './global/headerModeToggler.js';
import { setupGlobalUndoRedo } from './global/undo-redo.js';
import { registerVelocityModeHandlers } from './sequencer/ui/modals/velocity/velocityModalHandlers.js';
import { registerVelocityMenuHandlers } from './sequencer/ui/modals/velocity/velocityModeMenu.js';
import { undo, redo } from './appState/stateHistory';
import { setupWhatsNewButton } from './global/whatsnew.js';
import { showSplashScreen } from './global/splashscreen.js';
import { setupHelpButton } from './global/helpbutton.js';
import { setupKeyboard } from './setup/setupKeyboard.js';
import { setupVisualizer } from './setup/visualizer.js';
import { getSequencers, sequencers, setupAddTrackButton } from './setup/sequencers.js';
import { SEQUENCER_CONFIG as config } from './sequencer/constants/sequencerConstants.js';
import { setupUI } from './sequencer/ui.js';
import { initFooterUI } from './setup/footerUI.js';
import { showSaveWavOptionsModal } from './export/interaction/saveWavMenu.js';
import { registerSaveWavMenuHandlers } from './export/interaction/saveWavMenuHandlers.js';
import { exportSessionToJSON } from './export/save.js';
import { exportSessionToMIDI } from './export/midi/exportToMidi.js';
import { importSessionFromJSON } from './export/load.js';
import { importSessionFromMIDI } from './export/midi/loadFromMidi.js';
import { loadSession } from './export/loadSession.js';
import { setupNoteDurationButtons } from './setup/noteDurationButtons.js';
import { drawGlobalMiniContour } from './sequencer/grid/drawing/mini-contour.js';
import { initGlobalPlayhead } from './playhead/global-playhead.js';
import { startMasterPlayheadLoop, cancelMasterPlayheadLoop, resetPlayheads } from './playhead/playhead-engine.js';
import { initGlobalPlayheadInteraction } from './playhead/global-playhead-interaction.js';
import { setupControlModeSwitch } from './setup/controlModeSwitch.js';
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { getAppState, recordDiff } from './appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';
import { setupInstrumentSelector } from './setup/instrumentSelector.js';
import { 
  updateTotalMeasures, 
  updateTimeSignature, 
  updateTempo, 
  setLoopEnabled } from './sequencer/transport.js';

// === Immediately show splash screen //
showSplashScreen();

// === Playback Engine
import { PlaybackEngine } from './sequencer/playback.js';
export const engine = new PlaybackEngine(getSequencers());
engine.setOnResumeCallback(() => startMasterPlayheadLoop(engine));

// === State Sync ===
onStateUpdated(resyncFromState);

// === Instrument Selector ===
setupInstrumentSelector();

// === Playhead ===
function refreshGlobalMiniContour(): void {
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;
  if (canvas) drawGlobalMiniContour(canvas, sequencers);
}
const globalMiniCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;
const globalPlayheadCanvas = document.getElementById('global-mini-playhead') as HTMLCanvasElement;
initGlobalPlayhead(globalPlayheadCanvas);
initGlobalPlayheadInteraction(globalPlayheadCanvas, config);

// === Initial Sequencer ===
const firstId = 0;
const firstInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
recordDiff(
  createCreateSequencerDiff(firstId, firstInstrument),
  createReverseCreateSequencerDiff(firstId)
);

// === Virtual Piano Keyboard ===
const pianoCanvas = document.getElementById('piano') as HTMLCanvasElement;
setupKeyboard(pianoCanvas);

// === Visualizer ===
const waveform = document.getElementById('waveform') as HTMLCanvasElement;
const visualizerMode = document.getElementById('visualizer-mode') as HTMLButtonElement;
const visualizer = setupVisualizer(waveform, visualizerMode);

// Lock in the initial application state so undo never goes before this point
recordDiff(
  createCheckpointDiff('Initial App State'),
  createReverseCheckpointDiff('Initial App State')
);

// === Additional UI Setup ===
setupGlobalUndoRedo(undo, redo);
refreshGlobalMiniContour();
setupAddTrackButton();
setupNoteDurationButtons();
registerVelocityModeHandlers();
registerVelocityMenuHandlers();
registerSaveWavMenuHandlers();
setupControlModeSwitch();
initFooterUI();
setupWhatsNewButton();
setupHelpButton();
setupHeaderModeToggler();

// === UI Wiring ===
setupUI({
  getSequencers: () => sequencers,
  onPlay: async () => {
    await engine.start();
    startMasterPlayheadLoop(engine);
  },
  onPause: async () => {
    await engine.pause();
    cancelMasterPlayheadLoop();
  },
  onResume: async () => {
    await engine.resume();
  },  
  onStop: () => {
    engine.stop();
    cancelMasterPlayheadLoop();
    resetPlayheads(engine);
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
    setLoopEnabled(enabled);
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
      showSaveWavOptionsModal();
    } else if (format === 'midi') {
      const { url, filename } = await exportSessionToMIDI(appState);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }    
  },  
  onLoad: async (file: File) => {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
  
      if (extension === 'json') {
        const { tracks, globalConfig } = await importSessionFromJSON(file);
        loadSession(tracks, globalConfig);
      } else if (extension === 'mid' || extension === 'midi') {
        const { tracks, globalConfig } = await importSessionFromMIDI(file);
        loadSession(tracks, globalConfig);
      } else {
        throw new Error('Unsupported file type.');
      }
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

hideSplashScreen();
