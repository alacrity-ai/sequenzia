// src/sequencer/matrix/renderers/AnimationRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

export class AnimationRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    // For now, just clear any residual drawing effects
    // In the future: visual overlays, ghost notes, pulsing playhead, etc.

    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    // Example: optional debug overlay or frame marker
    // ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    // ctx.fillRect(0, 0, 10, 10);
  }
}
