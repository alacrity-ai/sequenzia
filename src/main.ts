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
import { getSequencers, sequencers } from '@/components/sequencer/factories/SequencerFactory.js';
import { SEQUENCER_CONFIG as config } from '@/components/sequencer/constants/sequencerConstants.js';
import { setupInstrumentSelector } from '@/components/sequencer/ui/controls/instrumentSelector.js';

// Global Controls and UI
import { GlobalControlsController } from '@/components/globalControls/GlobalControlsController.js';
import { GlobalPopupController } from '@/components/globalPopups/globalPopupController.js';
import { setupGlobalUndoRedo } from '@/shared/modals/global/undo-redo.js';
import { showSplashScreen, hideSplashScreen } from '@/shared/modals/global/splashscreen.js';
import { VisualizerController } from '@/components/visualizer/visualizerController.js';
import { SideMenuController } from '@/components/topControls/components/sideMenu/sideMenuController.js';

// User Config Modal
import { UserConfigModalController } from '@/components/userSettings/userConfig.js';

// Input / Visualizers
import { setupKeyboard } from '@/components/keyboard/factory/setupKeyboard.js';

// Setup (Deprecated)
import { setupAddTrackButton } from '@/components/sequencer/ui/setupAddTrackButton.js';

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

// === Top Controls ===
const sideMenu = new SideMenuController();
orchestrator.registerReloadable(() => sideMenu.reload());

// === Global Controls ===
const globalControls = new GlobalControlsController(engine, userConfigModalController);
orchestrator.registerReloadable(() => globalControls.reload());
globalControls.show();

// === Global Popup Modals ===
export const popupsController = new GlobalPopupController(() => {
  console.warn('User cancelled loading.');
});
orchestrator.registerReloadable(() => popupsController.reload());

// === Visualizer ===
const visualizer = new VisualizerController();
orchestrator.registerReloadable(() => visualizer.reload());
visualizer.show();

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

// Lock in the initial application state so undo never goes before this point
recordDiff(
  createCheckpointDiff('Initial App State'),
  createReverseCheckpointDiff('Initial App State')
);

// === Additional UI Setup ===
devLog('Setting up additional UI...');
setupGlobalUndoRedo(undo, redo);
setupAddTrackButton();

hideSplashScreen();
logMessage('Sequenzia initialized');
devLog('Current config: ', config);
devLog('Current sequencers: ', sequencers[0]);
devLog('Current state: ', getAppState());
