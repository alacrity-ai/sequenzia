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
          layout: {
            verticalCellRatio,
            baseCellWidth,
            totalRows,
            labelWidth,
            headerHeight
          },
          behavior: { zoom }
        } = this.config;
      
        const scrollX = this.scroll.getX();
        const scrollY = this.scroll.getY();
        const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
        const totalGridHeight = totalRows * cellHeight + headerHeight;
      
        ctx.save();
        ctx.translate(labelWidth - scrollX, -scrollY);
      
        // Subtle glow & refined line
        const x = this.x;
        const glowColor = 'rgba(255, 50, 50, 0.3)';
        const strokeColor = 'rgba(255, 80, 80, 0.9)';
      
        // Outer glow
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, totalGridHeight);
        ctx.stroke();
      
        // Inner crisp line
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, totalGridHeight);
        ctx.stroke();
      
        ctx.restore();
      }
         
  }
  