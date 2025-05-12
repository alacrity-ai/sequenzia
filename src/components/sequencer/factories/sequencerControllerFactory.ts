// src/components/sequencer/factories/SequencerControllerFactory.ts

import { SequencerController } from '@/components/sequencer/sequencerController.js';
import { registerSequencerController, createId } from '@/components/sequencer/stores/sequencerControllerStore.js';
import { UIOrchestrator } from '@/shared/ui/UIOrchestrator';
import type { SequencerState } from '@/appState/interfaces/AppState.js';

/**
 * Public factory for consumers needing a fully-wired SequencerController.
 * @param parentContainer - The container element where the sequencer should mount.
 * @param sequencerState - The initial sequencer state.
 * @returns SequencerController instance (exposes sequencer, grid, etc).
 */
export function createSequencerController(
  parentContainer: HTMLElement,
  sequencerState: SequencerState
): SequencerController {
  // Get a new Id from the sequencerControllerStore
  const id = sequencerState.id;
  
  // Create the controller by passing in the Id  (new field I just added)
  const controller = new SequencerController(parentContainer, sequencerState, id);
  
  // Register with that Id
  registerSequencerController(id, controller);

  // Register to UIOrchestrator
  const orchestrator = UIOrchestrator.getInstance();
  orchestrator.registerReloadable(() => controller.reload());

  return controller
}
