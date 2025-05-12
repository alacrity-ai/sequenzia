// src/components/sequencer/ui/helpers/setCollapsed.ts

import type Sequencer from '@/components/sequencer/sequencer.js';

import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { getSequencerControllerById } from '@/components/sequencer/stores/sequencerControllerStore.js';
import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { drawMiniContour } from '@/components/sequencer/renderers/drawMiniContour.js';

/**
 * Sets the collapsed state of a sequencer in the UI (hides body, shows mini-contour).
 * This does not modify app state or record any undoable diffs.
 */
export function setCollapsed(seq: Sequencer, val: boolean = true): void {
  const controller = getSequencerControllerById(seq.id);
  if (!controller) return;

  // Instantiate the playback engine
  const playbackEngine = PlaybackEngine.getInstance();

  // Get the DOM elements
  const body: HTMLElement | null = controller.getMatrixContainer();
  const mini: HTMLCanvasElement | null = controller.getMiniContourCanvas();
  if (!body || !mini) return;

  // Set the sequencer internal variables to collapsed
  seq.collapsed = val;
  controller.collapsed = val;

  // Hide/Show the grid body
  body.classList.toggle('hidden', val);
  // Hide/Show the mini contour
  mini.classList.toggle('hidden', !val);

  if (val) {
    // If collapsing: Hide zoom and grip handle UI
    controller.toggleZoomControls(false);
    controller.toggleGripHandle(false);

    // Clear any pending animations
    for (const id of seq.scheduledAnimations) clearTimeout(id);
    seq.scheduledAnimations = [];
    drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex); 
  } else {
    // If expanding: Show zoom and grip handle UI
    controller.toggleZoomControls(true);
    controller.toggleGripHandle(true);

    // Resize the grid (Refreshes it)
    seq.matrix?.resize();

    // Resume animations if playback is occurring
    if (playbackEngine.isActive()) {
      seq.resumeAnimationsFromCurrentTime(
        playbackEngine.getStartTime(),
        playbackEngine.getStartBeat()
      );
    }
  }
}

/**
 * Collapses all sequencers in the UI (hides body, shows mini-contour).
 * This does not modify app state or record any undoable diffs.
 */
export function collapseAllSequencers(): void {
  for (const seq of getSequencers()) {
    setCollapsed(seq, true);
  }
}