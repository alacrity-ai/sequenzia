// src/sequencer/matrix/renderers/LabelColumnRenderer.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';

export class LabelColumnRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, headerHeight, labelWidth, totalRows },
      behavior: { zoom }
    } = this.config;
  
    const scrollY = this.scroll.getY();
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
  
    // 🔧 FIX: Use layout height (CSS size) instead of canvas buffer height
    const layoutHeight = ctx.canvas.offsetHeight ?? (totalRows * cellHeight + headerHeight);
  
    ctx.save();
    ctx.translate(0, -scrollY);
  
    // Background column (fixed left column)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, scrollY, labelWidth, layoutHeight);
  
    // Row labels
    ctx.fillStyle = '#ccc';
    ctx.font = `${Math.floor(cellHeight * 0.6)}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
  
    for (let r = 0; r < totalRows; r++) {
      const y = r * cellHeight + headerHeight;
      ctx.fillText((r + 1).toString(), labelWidth - 8, y + cellHeight / 2);
    }
  
    ctx.restore();
  }  
}
