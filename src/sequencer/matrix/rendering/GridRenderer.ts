// src/sequencer/matrix/renderers/GridRenderer.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';

export class GridRenderer {
  private scroll: GridScroll;
  private config: GridConfig;
  private interactionStore: InteractionStore;

  constructor(
    scroll: GridScroll,
    config: GridConfig,
    interactionStore: InteractionStore
  ) {
    this.scroll = scroll;
    this.config = config;
    this.interactionStore = interactionStore;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      totalMeasures,
      beatsPerMeasure,
      layout: {
        baseCellWidth,
        verticalCellRatio,
        labelWidth,
        headerHeight
      },
      behavior: { zoom }
    } = this.config;
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const visibleBeats = (ctx.canvas.width - labelWidth) / cellWidth;
    const totalBeats = totalMeasures * beatsPerMeasure;

    ctx.save();
    ctx.translate(labelWidth - scrollX, -scrollY);

    const startBeat = Math.max(0, Math.floor((scrollX - labelWidth) / cellWidth));
    const endBeat = Math.min(totalBeats, startBeat + visibleBeats + 2); // add buffer for sub-pixel    

    // Vertical lines
    for (let i = startBeat; i <= endBeat; i++) {
      if (i < 0 || i >= totalBeats) continue;
      const x = i * cellWidth;
      ctx.strokeStyle = i % beatsPerMeasure === 0 ? '#888' : '#444';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.config.layout.totalRows * cellHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let r = 0; r <= this.config.layout.totalRows; r++) {
      const y = r * cellHeight;
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalBeats * cellWidth, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
