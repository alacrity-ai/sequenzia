// src/shared/playback/helpers/drawGlobalMiniContour.ts

import { drawGlobalMiniContour as redraw } from '@/components/globalControls/renderers/GlobalMiniContourRenderer.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

export function drawGlobalMiniContour(): void {
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (!canvas) return;
  const sequencers = getSequencers();
  redraw(canvas, sequencers);
}

export function drawGlobalMiniContourInCanvas(canvas: HTMLCanvasElement, sequencerArray: Sequencer[]): void {
  redraw(canvas, sequencerArray);
}
