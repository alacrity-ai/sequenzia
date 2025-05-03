// src/sequencer/matrix/rendering/NotePreviewRenderer.ts

import { drawRoundedRect } from '../utils/roundedRect.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { Grid } from '../Grid.js';

export class NotePreviewRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private store: InteractionStore,
    private grid: Grid
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const hovered = this.store.getHoveredNotePosition?.();
    if (!hovered) return;

    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight },
      behavior: { zoom },
    } = this.config;

    const duration = this.grid.getNoteDuration();
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const noteWidth = cellWidth * duration;
    const px = hovered.x * cellWidth;
    const py = hovered.y * cellHeight;

    ctx.save();
    ctx.translate(labelWidth - this.scroll.getX(), headerHeight - this.scroll.getY());
    ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
    drawRoundedRect(ctx, px, py, noteWidth, cellHeight, 3);
    ctx.fill();
    ctx.restore();
  }
}
