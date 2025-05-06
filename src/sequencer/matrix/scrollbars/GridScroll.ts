// src/sequencer/matrix/GridScroll.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import { getContentWidth, getContentHeight } from '../utils/gridDimensions.js';

export class GridScroll {
  private config: GridConfig;
  private canvas: HTMLElement;

  private scrollX = 0;
  private scrollY = 0;

  constructor(canvas: HTMLElement, config: GridConfig) {
    this.canvas = canvas;
    this.config = config;
  }

  public getX(): number {
    return this.scrollX;
  }

  public getY(): number {
    return this.scrollY;
  }

  public setScroll(x: number, y: number): void {
    this.scrollX = this.clampX(x);
    this.scrollY = this.clampY(y);
  }

  public recalculateBounds(): void {
    // No-op for now — could precompute max scrollX/Y here
  }

  public getMaxScrollX(): number {
    const visibleWidth = this.canvas.offsetWidth;
    return Math.max(0, this.getContentWidth() - visibleWidth);
  }
  
  public getMaxScrollY(): number {
    const visibleHeight = this.canvas.offsetHeight - this.config.layout.headerHeight;
    return Math.max(0, this.getContentHeight() - visibleHeight);
  }

  private clampX(x: number): number {
    return Math.max(0, Math.min(x, this.getMaxScrollX()));
  }

  private clampY(y: number): number {
    return Math.max(0, Math.min(y, this.getMaxScrollY()));
  }

  public getContentWidth(): number {
    return getContentWidth(this.config);
  }
  
  public getContentHeight(): number {
    return getContentHeight(this.config);
  }
}
