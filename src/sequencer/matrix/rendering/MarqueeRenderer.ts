// src/sequencer/matrix/renderers/MarqueeRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import { drawRoundedRect } from '../utils/roundedRect.js';

export class MarqueeRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private interactionStore: InteractionStore
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const box = this.interactionStore.getMarqueeBox();
    if (!box) return;

    const {
      layout: { baseCellWidth, verticalCellRatio },
      behavior: { zoom },
    } = this.config;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const left = Math.min(box.startX, box.currentX);
    const top = Math.min(box.startY, box.currentY);
    const width = Math.abs(box.currentX - box.startX);
    const height = Math.abs(box.currentY - box.startY);

    if (width < 1 || height < 1) return;

    ctx.save();
    ctx.translate(this.config.layout.labelWidth - scrollX, this.config.layout.headerHeight - scrollY);

    ctx.strokeStyle = 'rgba(128, 90, 213, 1.0)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    drawRoundedRect(ctx, left, top, width, height, 3);
    ctx.stroke();

    ctx.restore();
  }
}
