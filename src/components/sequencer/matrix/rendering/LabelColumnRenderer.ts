// src/components/sequencer/matrix/renderers/LabelColumnRenderer.ts

import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import { rowToNote } from '@/shared/utils/musical/noteUtils.js';
import { computeBlackKeyMidiMap } from '@/shared/utils/musical/noteUtils.js';
import { getUserConfig } from '@/components/userSettings/store/userConfigStore.js';
import { GRID_COLOR_SCHEMES } from '@/components/sequencer/matrix/rendering/colors/constants/colorSchemes.js';

export class LabelColumnRenderer {
  private blackKeyMap: Map<number, boolean>;

  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private getCustomLabels: () => Record<number, string> | null,
    private getBlackKeyMap: () => Map<number, boolean>
  ) {
    const { lowestMidi, highestMidi } = config.layout;
    this.blackKeyMap = computeBlackKeyMidiMap(lowestMidi, highestMidi);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, headerHeight, labelWidth, highestMidi, lowestMidi },
      behavior: { zoom }
    } = this.config;

    const { gridColorScheme: schemeKey } = getUserConfig().theme;
    const scheme = GRID_COLOR_SCHEMES[schemeKey];

    const totalRows = highestMidi - lowestMidi + 1;
    const scrollY = this.scroll.getY();
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
    const layoutHeight = ctx.canvas.offsetHeight ?? (totalRows * cellHeight + headerHeight);

    ctx.save();
    ctx.translate(0, -scrollY);

    // Label column background
    const gradient = ctx.createLinearGradient(0, 0, 0, layoutHeight);
    gradient.addColorStop(0, scheme.labelWhite);
    gradient.addColorStop(1, scheme.labelBlack);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, scrollY, labelWidth, layoutHeight);

    ctx.font = `${Math.floor(cellHeight * 0.6)}px 'Inter', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Right-side border
    ctx.strokeStyle = scheme.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelWidth - 0.5, scrollY);
    ctx.lineTo(labelWidth - 0.5, scrollY + layoutHeight);
    ctx.stroke();

    const customLabels = this.getCustomLabels();

    for (let r = 0; r < totalRows; r++) {
      const y = r * cellHeight + headerHeight;
      const midi = highestMidi - r;
      const noteName = customLabels?.[midi] ?? rowToNote(r, lowestMidi, highestMidi);
      const isBlackKey = this.getBlackKeyMap().get(midi) ?? false;

      ctx.fillStyle = isBlackKey ? scheme.textBlack : scheme.textWhite;
      ctx.fillText(noteName, labelWidth - 8, y + cellHeight / 2);
    }

    ctx.restore();
  }
}
