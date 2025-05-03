// src/sequencer/matrix/renderers/PlayheadRenderer.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';

export class PlayheadRenderer {
    private x: number | null = null;
  
    constructor(
      private scroll: GridScroll,
      private config: GridConfig
    ) {}
  
    public setPlayheadX(x: number): void {
      this.x = x;
    }
  
    public clear(): void {
      this.x = null;
    }
  
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.x == null) return;
      
        const {
          layout: { labelWidth, verticalCellRatio, baseCellWidth, totalRows = 88 },
          behavior: { zoom }
        } = this.config;
      
        const scrollX = this.scroll.getX();
        const scrollY = this.scroll.getY();
        const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
        const extraHeight = 24;
      
        const totalGridHeight = totalRows * cellHeight + extraHeight;
      
        ctx.save();
        ctx.translate(labelWidth - scrollX, -scrollY);
      
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, totalGridHeight);
        ctx.stroke();
      
        ctx.restore();
      }
      
  }
  