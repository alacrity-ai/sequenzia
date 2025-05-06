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
          labelWidth,
          headerHeight,
          highestMidi,
          lowestMidi
        },
        behavior: { zoom }
      } = this.config;
    
      const totalRows = highestMidi - lowestMidi + 1;
      const scrollX = this.scroll.getX();
      const scrollY = this.scroll.getY();
      const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
      const totalGridHeight = totalRows * cellHeight + headerHeight;
    
      const x = this.x;
    
      ctx.save();
      ctx.translate(labelWidth - scrollX, -scrollY);
    
      // === Tailwind-styled playhead ===
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(168, 85, 247, 1.0)'; // solid purple-500
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)'; // soft glow
      ctx.shadowBlur = 6;
    
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalGridHeight);
      ctx.stroke();
    
      ctx.restore();
    }
    
         
  }
  