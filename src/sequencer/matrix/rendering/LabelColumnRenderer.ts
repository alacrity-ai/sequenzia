// src/sequencer/matrix/renderers/LabelColumnRenderer.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import { rowToNote } from '../utils/noteUtils.js';
import { computeBlackKeyRowMap } from '../utils/noteUtils.js';
import { getUserConfig } from '../../../userconfig/settings/userConfig.js';
import { GRID_COLOR_SCHEMES } from '../rendering/colors/constants/colorSchemes.js';

export class LabelColumnRenderer {
  private blackKeyRowMap: boolean[];

  constructor(
    private scroll: GridScroll,
    private config: GridConfig
  ) {
    const { lowestMidi, highestMidi } = config.layout;
    this.blackKeyRowMap = computeBlackKeyRowMap(lowestMidi, highestMidi);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, headerHeight, labelWidth, highestMidi, lowestMidi },
      behavior: { zoom }
    } = this.config;

    const { gridColorScheme: schemeKey } = getUserConfig();
    const scheme = GRID_COLOR_SCHEMES[schemeKey];

    const totalRows = highestMidi - lowestMidi + 1;
    const scrollY = this.scroll.getY();
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
    const layoutHeight = ctx.canvas.offsetHeight ?? (totalRows * cellHeight + headerHeight);

    ctx.save();
    ctx.translate(0, -scrollY);

    // 🎨 Label column background
    const gradient = ctx.createLinearGradient(0, 0, 0, layoutHeight);
    gradient.addColorStop(0, scheme.labelWhite);
    gradient.addColorStop(1, scheme.labelBlack);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, scrollY, labelWidth, layoutHeight);

    ctx.font = `${Math.floor(cellHeight * 0.6)}px 'Inter', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Right-side border to separate from the note grid
    ctx.strokeStyle = scheme.gridLine; // or a dedicated border color if desired
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelWidth - 0.5, scrollY); // offset by 0.5 for pixel-perfect 1px line
    ctx.lineTo(labelWidth - 0.5, scrollY + layoutHeight);
    ctx.stroke();


    for (let r = 0; r < totalRows; r++) {
      const y = r * cellHeight + headerHeight;
      const noteName = rowToNote(r, lowestMidi, highestMidi);
      const isBlackKey = this.blackKeyRowMap[r];

      ctx.fillStyle = isBlackKey ? scheme.textBlack : scheme.textWhite;
      ctx.fillText(noteName, labelWidth - 8, y + cellHeight / 2);
    }

    ctx.restore();
  }
}
