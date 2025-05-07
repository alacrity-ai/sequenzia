// src/sequencer/matrix/renderers/GridRenderer.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import { getUserConfig } from '../../../userconfig/settings/userConfigStore.js';
import { GRID_COLOR_SCHEMES } from './colors/constants/colorSchemes.js';

export class GridRenderer {
  private scroll: GridScroll;
  private config: GridConfig;
  private interactionStore: InteractionStore;

  constructor(
    scroll: GridScroll,
    config: GridConfig,
    interactionStore: InteractionStore,
    private getBlackKeyMap: () => Map<number, boolean>
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
  
    const { gridColorScheme: schemeKey } = getUserConfig().theme;
    const scheme = GRID_COLOR_SCHEMES[schemeKey];
  
    const totalRows = this.config.layout.highestMidi - this.config.layout.lowestMidi + 1;
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
  
    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();
  
    const visibleBeats = (ctx.canvas.width - labelWidth) / cellWidth;
    const totalBeats = totalMeasures * beatsPerMeasure;
  
    ctx.save();
    ctx.translate(labelWidth - scrollX, headerHeight - scrollY);
  
    const startBeat = Math.max(0, Math.floor((scrollX - labelWidth) / cellWidth));
    const endBeat = Math.min(totalBeats, startBeat + visibleBeats + 2);
  
    // Horizontal lines and key shading
    for (let r = 0; r <= totalRows; r++) {
      const y = r * cellHeight;
  
      ctx.strokeStyle = scheme.gridLine;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalBeats * cellWidth, y);
      ctx.stroke();
  
      if (r < totalRows) {
        const midi = this.config.layout.highestMidi - r;
        const isBlack = this.getBlackKeyMap().get(midi);
        ctx.fillStyle = isBlack ? scheme.blackKey : scheme.whiteKey;
        ctx.fillRect(0, y, totalBeats * cellWidth, cellHeight);
      }
    }
  
    // Vertical lines for beats and measures
    for (let i = startBeat; i <= totalBeats; i++) {
      if (i < 0) continue;
  
      const x = i * cellWidth;
      if (i % beatsPerMeasure === 0) {
        ctx.strokeStyle = scheme.measureLine;
      } else {
        ctx.strokeStyle = scheme.beatLine;
      }
  
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalRows * cellHeight);
      ctx.stroke();
    }
  
    ctx.restore();
  }
  
}
