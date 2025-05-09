// src/main.ts
console.log('Importing styles/tailwind.css');
import './styles/tailwind.css';
console.log('Importing flowbite...');
import 'flowbite';

import { GlobalControlsController } from '@/globalControls';
import { UserConfigModalController } from './userSettings/userConfig.js';
import { UIOrchestrator } from './shared/ui/UIOrchestrator.js';

import { logMessage } from './shared/logging/logger.js';
import { devLog } from './shared/state/devMode.js';
import { registerDevTools } from './shared/dev/devTools.js';
import { hideSplashScreen } from './global/splashscreen.js';
import { setupHeaderModeToggler } from './global/headerModeToggler.js';
import { setupGlobalUndoRedo } from './global/undo-redo.js';
import { registerVelocityModeHandlers } from './sequencer/ui/modals/velocity/velocityModalHandlers.js';
import { registerVelocityMenuHandlers } from './sequencer/ui/modals/velocity/velocityModeMenu.js';
import { undo, redo } from './appState/stateHistory';
import { setupWhatsNewButton } from './global/whatsnew.js';
import { showSplashScreen } from './global/splashscreen.js';
import { setupHelpButton } from './global/helpbutton.js';
import { setupKeyboard } from './keyboard/factory/setupKeyboard.js';
import { setupVisualizer } from './visualizer/visualizer.js';
import { getSequencers, sequencers,  } from './sequencer/factories/SequencerFactory.js';
import { setupAddTrackButton } from './setup/setupAddTrackButton.js';
import { SEQUENCER_CONFIG as config } from './sequencer/constants/sequencerConstants.js';
import { setupUI } from './setup/footer/ui.js';
import { initFooterUI } from './setup/footer/footerUI.js';
import { showSaveWavOptionsModal } from './export/interaction/saveWavMenu.js';
import { registerSaveWavMenuHandlers } from './export/interaction/saveWavMenuHandlers.js';
import { exportSessionToJSON } from './export/save.js';
import { exportSessionToMIDI } from './export/midi/exportToMidi.js';
import { importSessionFromJSON } from './export/load.js';
import { importSessionFromMIDI } from './export/midi/loadFromMidi.js';
import { loadSession } from './export/loadSession.js';
import { setupNoteDurationButtons } from './setup/footer/noteDurationButtons.js';
// import { startMasterPlayheadLoop, cancelMasterPlayheadLoop, resetPlayheads } from './playhead/playhead-engine.js';
// import { initGlobalPlayheadInteraction } from './playhead/global-playhead-interaction.js';
import { setupControlModeSwitch } from './setup/footer/controlModeSwitch.js';
import { PlaybackEngine } from './shared/playback/PlaybackEngine.js';
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { getAppState, recordDiff } from './appState/appState.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';
import { setupInstrumentSelector } from './sequencer/ui/controls/instrumentSelector.js';


// === Immediately show splash screen //
devLog('Showing splash screen...');
showSplashScreen();

// === Dev Mode Toggle
devLog('Registering dev tools...');
registerDevTools();

// === UI Orchestrator
const orchestrator = UIOrchestrator.getInstance();

// === Userconfig Init
const userConfigModalController = new UserConfigModalController();
orchestrator.registerReloadable(() => userConfigModalController.reload());

// === Playback Engine
export const engine = new PlaybackEngine(getSequencers());

// === Global Controls ===
devLog('Initializing global controls...');
const globalControls = new GlobalControlsController(engine, userConfigModalController);
orchestrator.registerReloadable(() => globalControls.reload());
globalControls.show();

// === State Sync ===
onStateUpdated(resyncFromState);

// === Instrument Selector ===
setupInstrumentSelector();

// === Initial Sequencer ===
devLog('Creating initial sequencer...');
const firstId = 0;
const firstInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
recordDiff(
  createCreateSequencerDiff(firstId, firstInstrument),
  createReverseCreateSequencerDiff(firstId)
);

// === Virtual Piano Keyboard ===
devLog('Setting up virtual piano keyboard...');
const pianoCanvas = document.getElementById('piano') as HTMLCanvasElement;
setupKeyboard(pianoCanvas);

// === Visualizer ===
devLog('Setting up visualizer...');
const waveform = document.getElementById('waveform') as HTMLCanvasElement;
const visualizerMode = document.getElementById('visualizer-mode') as HTMLButtonElement;
void setupVisualizer(waveform, visualizerMode);

// Lock in the initial application state so undo never goes before this point
recordDiff(
  createCheckpointDiff('Initial App State'),
  createReverseCheckpointDiff('Initial App State')
);

// === Additional UI Setup ===
devLog('Setting up additional UI...');
setupGlobalUndoRedo(undo, redo);
setupAddTrackButton();

registerVelocityModeHandlers();
registerVelocityMenuHandlers();
registerSaveWavMenuHandlers();
setupHeaderModeToggler();

// setupWhatsNewButton();
// setupHelpButton();
// setupControlModeSwitch();
// setupNoteDurationButtons();
// initFooterUI();

// === UI Wiring ===
// setupUI({
//   getSequencers: () => sequencers,
//   onPlay: async () => {
//     await engine.start();
//     startMasterPlayheadLoop(engine);
//   },
//   onPause: async () => {
//     await engine.pause();
//     cancelMasterPlayheadLoop();
//   },
//   onResume: async () => {
//     await engine.resume();
//   },  
//   onStop: () => {
//     engine.stop();
//     cancelMasterPlayheadLoop();
//     resetPlayheads(engine);
//   },
//   onDurationChange: (val: number) => {
//     config.currentDuration = val;
//     sequencers.forEach(seq => (seq.config.currentDuration = val));
//   },
//   onSnapChange: (val: number) => {
//     config.snapResolution = val;
//     sequencers.forEach(seq => (seq.config.snapResolution = val));
//   },
//   onToggleLoop: (enabled: boolean) => {
//     config.loopEnabled = enabled;
//     sequencers.forEach(seq => (seq.config.loopEnabled = enabled));
//     setLoopEnabled(enabled);
//   },
//   onTempoChange: (tempo: number) => {
//     updateTempo(tempo);
//   },
//   onSave: async (format: string) => {
//     const appState = getAppState(); // ✅
  
//     if (format === 'json') {
//       const { url, filename } = exportSessionToJSON(appState);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;
//       a.click();
//       URL.revokeObjectURL(url);
//     } else if (format === 'wav') {
//       showSaveWavOptionsModal();
//     } else if (format === 'midi') {
//       const { url, filename } = await exportSessionToMIDI(appState);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;
//       a.click();
//       URL.revokeObjectURL(url);
//     }    
//   },  
//   onLoad: async (file: File) => {
//     try {
//       const extension = file.name.split('.').pop()?.toLowerCase();
  
//       if (extension === 'json') {
//         const { tracks, globalConfig } = await importSessionFromJSON(file);
//         loadSession(tracks, globalConfig);
//       } else if (extension === 'mid' || extension === 'midi') {
//         const { tracks, globalConfig } = await importSessionFromMIDI(file);
//         loadSession(tracks, globalConfig);
//       } else {
//         throw new Error('Unsupported file type.');
//       }
//     } catch (err) {
//       if (err instanceof Error) {
//         alert('Failed to load file: ' + err.message);
//       } else {
//         alert('Failed to load file: Unknown error');
//       }
//     }
//   },
//   onMeasuresChange: (totalMeasures: number) => {
//     updateTotalMeasures(totalMeasures);

//     const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
//     if (canvas) drawGlobalMiniContour(canvas, sequencers);
//   },
//     onBeatsPerMeasureChange: (beatsPerMeasure: number) => {
//     updateTimeSignature(beatsPerMeasure);

//     const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
//     if (canvas) drawGlobalMiniContour(canvas, sequencers);
//   }
// });

hideSplashScreen();
logMessage('Sequenzia initialized');
devLog('Current config: ', config);
devLog('Current sequencers: ', sequencers[0]);
devLog('Current state: ', getAppState());
