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
      layout: { labelWidth, baseCellWidth, verticalCellRatio, headerHeight },
      totalMeasures,
      beatsPerMeasure,
      behavior: { zoom }
    } = this.config;
  
    const cellWidth = baseCellWidth * zoom;
    const totalBeats = totalMeasures * beatsPerMeasure;
    const totalGridWidth = labelWidth + totalBeats * cellWidth;
  
    const scrollX = this.scroll.getX();
  
    ctx.save();
    ctx.translate(labelWidth - scrollX, 0);
  
    // 🔧 FIX 1: Use layout width instead of canvas buffer size
    const layoutWidth = ctx.canvas.offsetWidth ?? totalGridWidth;
  
    // Header background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(-labelWidth + scrollX, 0, layoutWidth, headerHeight);
  
    // Measure lines + labels
    for (let measure = 0; measure < totalMeasures; measure++) {
      const beatIndex = measure * beatsPerMeasure;
      const x = beatIndex * cellWidth;
  
      // Vertical measure divider
      ctx.strokeStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, headerHeight); // 🔧 FIX 2: limit line to header height
      ctx.stroke();
  
      // Measure label
      ctx.fillStyle = '#ccc';
      ctx.font = `${Math.floor(headerHeight * 0.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`M${measure + 1}`, x + (beatsPerMeasure * cellWidth) / 2, 4);
    }
  
    ctx.restore();
  }
  
}
