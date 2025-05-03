// src/sequencer/matrix/renderers/HeaderPlayheadRenderer.ts
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';

export class HeaderPlayheadRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, headerHeight, labelWidth },
      totalMeasures,
      beatsPerMeasure,
      behavior: { zoom }
    } = this.config;
  
    const cellWidth = baseCellWidth * zoom;
    const totalBeats = totalMeasures * beatsPerMeasure;
  
    const scrollX = this.scroll.getX();
  
    ctx.save();
    ctx.translate(labelWidth - scrollX, 0);
  
    const layoutWidth = ctx.canvas.offsetWidth;
  
    // 🔷 Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    gradient.addColorStop(0, '#262626');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(-labelWidth + scrollX, 0, layoutWidth, headerHeight);
  
    // 🔠 Measure lines and labels
    for (let measure = 0; measure <= totalMeasures; measure++) {
      const beatIndex = measure * beatsPerMeasure;
      const x = beatIndex * cellWidth;
  
      // Grid line: strong every 4th, faint otherwise
      ctx.strokeStyle = (measure % 4 === 0) ? '#888' : '#444';
      ctx.lineWidth = (measure % 4 === 0) ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, headerHeight);
      ctx.stroke();
  
      // Text label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
  
      const isMajor = measure % 4 === 0;
      ctx.fillStyle = isMajor ? '#f0f0f0' : '#777';
      ctx.font = `${isMajor ? 'bold' : ''} ${Math.floor(headerHeight * 0.5)}px 'Inter', sans-serif`;
  
      const labelX = x + (beatsPerMeasure * cellWidth) / 2;
      ctx.fillText(`${measure + 1}`, labelX, 4);
    }
  
    ctx.restore();
  }
  
  
  
}
