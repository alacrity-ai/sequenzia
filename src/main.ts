// src/main.ts
import './styles/tailwind.css';
import 'flowbite';

// Core Application Utilities
import { devLog } from './shared/state/devMode.js';
import { logMessage } from './shared/logging/logger.js';
import { UIOrchestrator } from './shared/ui/UIOrchestrator.js';
import { registerDevTools } from './shared/dev/devTools.js';
import { registerGlobalEventGuards } from './shared/boot/GlobalEventGuards.js';

// State Management
import { getAppState, recordDiff } from './appState/appState.js';
import { undo, redo } from './appState/stateHistory';
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';

// Playback Engine
import { PlaybackEngine } from './shared/playback/PlaybackEngine.js';

// Sequencer System
import { getSequencers, sequencers } from './sequencer/factories/SequencerFactory.js';
import { SEQUENCER_CONFIG as config } from './sequencer/constants/sequencerConstants.js';
import { registerVelocityModeHandlers } from './sequencer/ui/modals/velocity/velocityModalHandlers.js';
import { registerVelocityMenuHandlers } from './sequencer/ui/modals/velocity/velocityModeMenu.js';
import { setupInstrumentSelector } from './sequencer/ui/controls/instrumentSelector.js';

// Global Controls and UI
import { GlobalControlsController } from '@/globalControls';
import { setupGlobalUndoRedo } from './global/undo-redo.js';
import { setupHeaderModeToggler } from './global/headerModeToggler.js';
import { showSplashScreen, hideSplashScreen } from './global/splashscreen.js';

// User Config Modal
import { UserConfigModalController } from './userSettings/userConfig.js';

// Input / Visualizers
import { setupKeyboard } from './keyboard/factory/setupKeyboard.js';
import { setupVisualizer } from './visualizer/visualizer.js';

// Setup (Deprecated)
import { setupAddTrackButton } from './setup/setupAddTrackButton.js';

// === Immediately show splash screen //
showSplashScreen();

// === Dev Mode Toggle
registerDevTools();

// === Global Event Guards ===
registerGlobalEventGuards();

// === UI Orchestrator
const orchestrator = UIOrchestrator.getInstance();

// === Userconfig Init
const userConfigModalController = new UserConfigModalController();
orchestrator.registerReloadable(() => userConfigModalController.reload());

// === Playback Engine
export const engine = new PlaybackEngine(getSequencers());

// === Global Controls ===
const globalControls = new GlobalControlsController(engine, userConfigModalController);
orchestrator.registerReloadable(() => globalControls.reload());
globalControls.show();

// === State Sync ===
onStateUpdated(resyncFromState);

// === Instrument Selector ===
setupInstrumentSelector();

// === Initial Sequencer ===
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
setupHeaderModeToggler();

hideSplashScreen();
logMessage('Sequenzia initialized');
devLog('Current config: ', config);
devLog('Current sequencers: ', sequencers[0]);
devLog('Current state: ', getAppState());
