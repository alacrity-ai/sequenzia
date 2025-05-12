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
import { onStateUpdated } from './appState/onStateUpdated.js';
import { resyncFromState } from './appState/resyncFromState.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from './appState/diffEngine/types/internal/checkpoint.js';
import { createCreateSequencerDiff, createReverseCreateSequencerDiff } from './appState/diffEngine/types/sequencer/createSequencer.js';

// Playback Engine
import { PlaybackEngine } from './shared/playback/PlaybackEngine.js';

// Sequencer System
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { createId } from './components/sequencer/stores/sequencerControllerStore';

// Global Controls and UI
import { GlobalControlsController } from '@/components/globalControls/GlobalControlsController.js';
import { GlobalPopupController } from '@/components/globalPopups/globalPopupController.js';
import { setupGlobalUndoRedo } from '@/shared/modals/global/undo-redo.js';
import { VisualizerController } from '@/components/visualizer/visualizerController.js';
import { TopControlsController } from '@/components/topControls/topControlsController.js';
import { UserConfigModalController } from '@/components/userSettings/userConfig.js';

// Setup (Deprecated / Needs dedicated Controllers)
import { setupAddTrackButton } from '@/components/sequencer/ui/setupAddTrackButton.js';
import { setupInstrumentSelector } from '@/components/sequencer/services/instrumentSelectorService.js';
import { undo, redo } from './appState/stateHistory';

// === Immediately show splash screen //
export const popupsController = new GlobalPopupController(() => {
  console.warn('User cancelled loading.');
});
popupsController.showSplashScreen();

// === Dev Mode Toggle
registerDevTools();

// === Global Event Guards ===
registerGlobalEventGuards();

// === Playback Engine
export const engine = new PlaybackEngine(getSequencers());

// === Userconfig Init
export const userConfigModalController = new UserConfigModalController();

// === Instrument Selector ===
setupInstrumentSelector(); // Refactor this into a dedicated controller

// === Top Controls ===
export const topControlsController = new TopControlsController();

// === Footer Controls (Transport) ===
export const globalControls = new GlobalControlsController(engine, userConfigModalController);
globalControls.show();

// === Visualizer ===
export const visualizer = new VisualizerController();
visualizer.show();

// === UI Orchestrator
const orchestrator = UIOrchestrator.getInstance();
orchestrator.registerReloadable(() => visualizer.reload());
orchestrator.registerReloadable(() => topControlsController.reload());
orchestrator.registerReloadable(() => userConfigModalController.reload());
orchestrator.registerReloadable(() => globalControls.reload());
orchestrator.registerReloadable(() => popupsController.reload());

// === State Sync ===
onStateUpdated(resyncFromState);

// === Additional UI Setup ===
devLog('Setting up additional UI...');
setupGlobalUndoRedo(undo, redo);
setupAddTrackButton();

// === Initial Sequencer ===
const firstId = createId();
const firstInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
recordDiff(
  createCreateSequencerDiff(firstId, firstInstrument),
  createReverseCreateSequencerDiff(firstId)
);

// Lock in the initial application state so undo never goes before this point
recordDiff(
  createCheckpointDiff('Initial App State'),
  createReverseCheckpointDiff('Initial App State')
);

popupsController.hideSplashScreen();
logMessage('Sequenzia initialized');
devLog('Current state: ', getAppState());
