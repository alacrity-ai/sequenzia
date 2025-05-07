// src/sequencer/matrix/renderers/HeaderPlayheadRenderer.ts
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import { getUserConfig } from '../../../userSettings/store/userConfigStore.js';
import { GRID_COLOR_SCHEMES } from '../rendering/colors/constants/colorSchemes.js';

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

    const { gridColorScheme: schemeKey } = getUserConfig().theme;
    const scheme = GRID_COLOR_SCHEMES[schemeKey];

    const cellWidth = baseCellWidth * zoom;
    const totalBeats = totalMeasures * beatsPerMeasure;
    const scrollX = this.scroll.getX();
    const layoutWidth = ctx.canvas.offsetWidth;

    ctx.save();
    ctx.translate(labelWidth - scrollX, 0);

    // 🔷 Gradient background from labelWhite → labelBlack
    const gradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    gradient.addColorStop(0, scheme.labelWhite);
    gradient.addColorStop(1, scheme.labelBlack);
    ctx.fillStyle = gradient;
    ctx.fillRect(-labelWidth + scrollX, 0, layoutWidth, headerHeight);

    // 🔠 Measure lines and number labels
    for (let measure = 0; measure <= totalMeasures; measure++) {
      const beatIndex = measure * beatsPerMeasure;
      const x = beatIndex * cellWidth;

      const isMajor = measure % 4 === 0;

      // Vertical measure marker line
      ctx.strokeStyle = isMajor ? scheme.measureLine : scheme.beatLine;
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, headerHeight);
      ctx.stroke();

      // Measure number label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isMajor ? scheme.textWhite : scheme.textBlack;
      ctx.font = `${isMajor ? 'bold' : ''} ${Math.floor(headerHeight * 0.5)}px 'Inter', sans-serif`;

      const labelX = x + (beatsPerMeasure * cellWidth) / 2;
      ctx.fillText(`${measure + 1}`, labelX, 4);
    }

    ctx.restore();
  }
}
