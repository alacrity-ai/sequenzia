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
import { getSequencers } from './components/sequencer/stores/sequencerStore.js';
import { loadUserConfigFromLocalStorage } from './components/userSettings/utils/localStorage.js';

// Playback Engine
import { PlaybackEngine, getPlaybackEngine } from './shared/playback/PlaybackEngine.js';

// Global Controls and UI
import { GlobalControlsController } from '@/components/globalControls/GlobalControlsController.js';
import { getGlobalPopupController } from '@/components/globalPopups/globalPopupController.js';
import { setupGlobalUndoRedo } from '@/shared/boot/setupGlobalUndo.js';
import { VisualizerController } from '@/components/visualizer/visualizerController.js';
import { TopControlsController } from '@/components/topControls/topControlsController.js';
import { UserConfigModalController } from '@/components/userSettings/userConfig.js';
import { getOverlaysController } from '@/components/overlays/overlaysController.js';
import { loadUserKeyMacroBindings } from '@/shared/keybindings/KeyMacroStore';

// Setup (Deprecated / Needs dedicated Controllers)
import { setupAddTrackButton } from '@/components/sequencer/ui/setupAddTrackButton.js';
import { undo, redo } from './appState/stateHistory';

function bootstrapSequenziaApp(): void {
  const popupsController = getGlobalPopupController();
  popupsController.showSplashScreen();

  loadUserConfigFromLocalStorage();
  loadUserKeyMacroBindings();
  registerDevTools();
  registerGlobalEventGuards();

  PlaybackEngine.initialize(getSequencers());

  const userConfigModalController = new UserConfigModalController();
  const overlaysController = getOverlaysController();
  const topControlsController = new TopControlsController();
  const globalControls = new GlobalControlsController(getPlaybackEngine(), userConfigModalController);
  const visualizer = new VisualizerController();

  globalControls.show();
  visualizer.show();

  const orchestrator = UIOrchestrator.getInstance();
  orchestrator.registerReloadable(() => visualizer.reload());
  orchestrator.registerReloadable(() => topControlsController.reload());
  orchestrator.registerReloadable(() => userConfigModalController.reload());
  orchestrator.registerReloadable(() => globalControls.reload());
  orchestrator.registerReloadable(() => popupsController.reload());
  orchestrator.registerReloadable(() => overlaysController.reload());

  onStateUpdated(resyncFromState);

  devLog('Setting up additional UI...');
  setupGlobalUndoRedo(undo, redo);
  setupAddTrackButton();

  const firstId = 0;
  const firstInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
  recordDiff(
    createCreateSequencerDiff(firstId, firstInstrument),
    createReverseCreateSequencerDiff(firstId)
  );

  recordDiff(
    createCheckpointDiff('Initial App State'),
    createReverseCheckpointDiff('Initial App State')
  );

  popupsController.hideSplashScreen();
  logMessage('Sequenzia initialized');
  devLog('Current state: ', getAppState());
}

// === Defer bootstrap until after first frame ===
requestAnimationFrame(() => {
  bootstrapSequenziaApp();
});
