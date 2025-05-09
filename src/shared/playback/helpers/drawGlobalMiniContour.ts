import { drawGlobalMiniContour as redraw } from '@/globalControls/renderers/GlobalMiniContourRenderer.js';
import { sequencers } from '@/sequencer/factories/SequencerFactory.js';
import type Sequencer from '@/sequencer/sequencer.js';

export function drawGlobalMiniContour(): void {
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
  if (!canvas) return;
  redraw(canvas, sequencers);
}

export function drawGlobalMiniContourInCanvas(canvas: HTMLCanvasElement, sequencerArray: Sequencer[]): void {
  redraw(canvas, sequencerArray);
}
